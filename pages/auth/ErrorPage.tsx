// src/pages/ErrorPage.tsx
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();
  
  let errorMessage: string;
  
  if (isRouteErrorResponse(error)) {
    // Error is a route error
    errorMessage = error.statusText || error.data?.message || 'Unknown error';
  } else if (error instanceof Error) {
    // Error is a JavaScript Error object
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    // Error is a string
    errorMessage = error;
  } else {
    // Unknown error type
    errorMessage = 'Unknown error occurred';
  }

  return (
    <div className="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{errorMessage}</i>
      </p>
    </div>
  );
}