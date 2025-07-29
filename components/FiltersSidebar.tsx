// components/FiltersSidebar.tsx
import React from "react";

export default function FiltersSidebar() {
  return (
    <div className="space-y-6">
      <div>
        <h6 className="font-semibold text-primary mb-2">Brand</h6>
        {/* replace with real filter controls */}
        <ul className="space-y-1">
          <li>
            <label>
              <input type="checkbox" className="mr-2" /> Nike
            </label>
          </li>
          <li>
            <label>
              <input type="checkbox" className="mr-2" /> Adidas
            </label>
          </li>
          <li>
            <label>
              <input type="checkbox" className="mr-2" /> Jordan
            </label>
          </li>
        </ul>
      </div>

      <div>
        <h6 className="font-semibold text-primary mb-2">Size</h6>
        <ul className="space-y-1">
          <li>
            <label>
              <input type="checkbox" className="mr-2" /> 7
            </label>
          </li>
          <li>
            <label>
              <input type="checkbox" className="mr-2" /> 8
            </label>
          </li>
          <li>
            <label>
              <input type="checkbox" className="mr-2" /> 9
            </label>
          </li>
        </ul>
      </div>

      <div>
        <h6 className="font-semibold text-primary mb-2">Price</h6>
        {/* For now just a placeholder */}
        <input type="range" min="0" max="500" className="w-full" />
      </div>
    </div>
  );
}
