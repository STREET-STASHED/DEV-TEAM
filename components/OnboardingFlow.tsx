// OnboardingFlow.jsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import type { User } from "@supabase/supabase-js";
// For TypeScript to recognize File
type File = globalThis.File;
// Use the DOM File type, no import needed
import { supabase } from "../lib/supabaseClient.ts";

// Onboarding steps
const STEPS = {
  ROLE: "role",
  DETAILS: "details",
  VERIFICATION: "verification",
  VERIFICATION_PENDING: "verification_pending",
  COMPLETE: "complete",
};

export default function OnboardingFlow() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [onboardingStatus, setOnboardingStatus] = useState<{
    role: string;
    verified: boolean;
    username?: string;
    current_step?: string;
  } | null>(null);
  const [currentStep, setCurrentStep] = useState(STEPS.ROLE);

  useEffect(() => {
    if (!router.pathname.startsWith("/onboarding")) return;

    const fetchUser = async () => {
      const { data: sessionData, error } = await supabase.auth.getSession();
      const _user = sessionData?.session?.user;
      if (error) {
        console.error("Error fetching user:", error);
        return;
      }
      if (_user) setUser(_user);
    };

    void fetchUser();
  }, [router.pathname, router]);

  useEffect(() => {
    if (!user || !router.pathname.startsWith("/onboarding")) return;
    if ((user as { role?: string })?.role !== "authenticated") return;
    void fetchOnboardingStatus();
  }, [user, router.pathname]);

  useEffect(() => {
    if (currentStep === STEPS.COMPLETE) {
      const role =
        onboardingStatus?.role || user?.user_metadata?.role || "buyer";
      const roleRedirects: Record<string, string> = {
        buyer: "/buyer/dashboard",
        "seller/brand": "/seller/dashboard",
        stylist: "/stylist/dashboard",
        driver: "/driver/dashboard",
      };
      void router.replace(roleRedirects[role] || "/marketplace");
    }
  }, [currentStep, onboardingStatus, user, router]);

  async function fetchOnboardingStatus() {
    try {
      setLoading(true);
      setError(null);

      const { data: sessionData, error: userError } =
        await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (userError || !user) {
        console.warn("No user found or failed to fetch user");
        return;
      }

      const access_token = sessionData?.session?.access_token;
      if (!user || !access_token) {
        console.warn(
          "Missing user or access token, aborting onboarding fetch.",
        );
        return;
      }

      const anonKey =
        typeof window !== "undefined"
          ? (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "")
          : "";

      let result;
      try {
        result = await supabase.functions.invoke("handle-onboarding", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${access_token}`,
            apikey: anonKey,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: user.user_metadata?.username,
          }),
        });
      } catch (parseErr) {
        console.error("[HANDLE-ONBOARDING PARSE ERROR]", parseErr);
        setError(new Error("Failed to parse onboarding response"));
        return;
      }

      const { error } = result;

      if (error) {
        console.error("[HANDLE-ONBOARDING ERROR]", error);
        setError(new Error("Failed to fetch onboarding status"));
        return;
      }

      setOnboardingStatus(
        result.data.status ? { ...result.data.status } : null,
      );
      setCurrentStep(result.data?.status?.current_step || STEPS.ROLE);
    } catch (error) {
      console.error("Error fetching onboarding status:", error);
      setError(new Error("Failed to load onboarding status"));
    } finally {
      setLoading(false);
    }
  }

  // Submit verification documents
  async function handleVerificationSubmission(
    documentType: string,
    documentUrl: string,
    notes: string,
  ) {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.functions.invoke("handle-onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          documentType,
          documentUrl,
          notes,
        }),
      });

      if (error) throw error;

      // Refresh onboarding status
      await fetchOnboardingStatus();
    } catch (error) {
      console.error("Error submitting verification:", error);
      setError(new Error("Failed to submit verification documents"));
    } finally {
      setLoading(false);
    }
  }

  // Render different steps based on current step
  function renderStep() {
    if (loading) return <div>Loading...</div>;
    if (error) return <div className="error">{error.message}</div>;

    switch (currentStep) {
      // ROLE and DETAILS steps are now handled at signup, so skip rendering them
      case STEPS.VERIFICATION:
        return (
          <VerificationStep
            onSubmit={(documentType, documentUrl, notes) => void handleVerificationSubmission(documentType, documentUrl, notes)}
            role={onboardingStatus?.role ?? ""}
          />
        );
      case STEPS.VERIFICATION_PENDING:
        return <VerificationPendingStep />;
      case STEPS.COMPLETE:
        return (
          <OnboardingCompleteStep
            verified={onboardingStatus?.verified ?? false}
            username={onboardingStatus?.username}
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  }

  return (
    <div className="onboarding-flow">
      <h1>Complete Your Profile</h1>
      {renderStep()}
    </div>
  );
}

function VerificationStep({
  onSubmit,
  role: _role,
}: {
  onSubmit: (documentType: string, documentUrl: string, notes: string) => void;
  role: string;
}) {
  const [documentType, setDocumentType] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [licensePlate, setLicensePlate] = useState("");

  // Role-specific document options
  const documentOptions: Record<string, string[]> = {
    stylist: ["certificate", "portfolio", "id"],
    "seller/brand": ["business_license", "resale_certificate", "id"],
    driver: ["driver_license", "vehicle_registration", "id"],
    buyer: ["id"], // fallback
  };

  const docTypes = documentOptions[_role] || ["id"];

  async function uploadDocument(file: File) {
    try {
      setUploading(true);

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `verification/${fileName}`;

      const { error } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("documents").getPublicUrl(filePath);

      setDocumentUrl(publicUrl);
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("Error uploading document");
    } finally {
      setUploading(false);
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(
      documentType,
      documentUrl,
      notes +
        (_role === "driver" && licensePlate ? ` | Plate: ${licensePlate}` : ""),
    );
  };

  // Role-specific instructions
  function renderInstructions(role: string) {
    switch (role) {
      case "stylist":
        return (
          <p>
            Please upload your professional certificate, portfolio, or ID for
            verification as a stylist.
          </p>
        );
      case "seller/brand":
        return (
          <p>
            Please upload your business license, resale certificate, or ID to
            verify your seller/brand account.
          </p>
        );
      case "driver":
        return (
          <p>
            Please upload your driver license, vehicle registration, or ID to
            verify your driver account.
          </p>
        );
      case "buyer":
      default:
        return <p>Please upload your ID to verify your buyer account.</p>;
    }
  }

  return (
    <div>
      <h2>Verification Required</h2>
      {renderInstructions(_role)}

      <form onSubmit={(e) => void handleSubmit(e)}>
        <div>
          <label>Document Type</label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            required
          >
            <option value="">Select document type</option>
            {docTypes.map((type) => (
              <option key={type} value={type}>
                {type.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Upload Document</label>
          <input
            type="file"
            onChange={(e) => void uploadDocument(e.target.files![0])}
            disabled={uploading}
          />
          {uploading && <p>Uploading...</p>}
          {documentUrl && <p>Document uploaded successfully!</p>}
        </div>

        {_role === "driver" && (
          <div>
            <label>License Plate Number</label>
            <input
              type="text"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              required
            />
          </div>
        )}

        <div>
          <label>Additional Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <button type="submit" disabled={!documentUrl || !documentType}>
          Submit for Verification
        </button>
      </form>
    </div>
  );
}

function VerificationPendingStep() {
  return (
    <div>
      <h2>Verification Pending</h2>
      <p>Your documents have been submitted and are pending review.</p>
      <p>We&apos;ll notify you once your account has been verified.</p>
    </div>
  );
}

function OnboardingCompleteStep({
  verified: _verified,
  username,
}: {
  verified: boolean;
  username?: string;
}) {
  return (
    <div>
      <h2>Onboarding Complete</h2>
      <p>Your profile is now set up{username ? ` as @${username}` : ""}!</p>
      {_verified ? (
        <p>Your account has been verified. You can now access all features.</p>
      ) : (
        <p>You can start using the app now.</p>
      )}
    </div>
  );
}
