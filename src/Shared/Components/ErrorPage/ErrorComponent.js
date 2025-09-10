import React from "react";
import { useNavigate } from "react-router-dom";
import "./ErrorPage.css";

const ErrorPage = () => {
  const navigate = useNavigate();

  const handleNavigateHome = () => {
    navigate("/");
  };

  return (
    <div className="error-page-container">
      <div className="background-gradient"></div>
      <div className="error-card">
        <svg
          className="ghost-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
          <path d="M15 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
          <path d="M17.5 16.5 16 15l1.5-1.5a2.15 2.15 0 0 1 1.5 2.5z" />
          <path d="M6.5 16.5 8 15l-1.5-1.5a2.15 2.15 0 0 0-1.5 2.5z" />
          <path d="M12 21.5c-3-.4-6-2.8-6-7.5l-.2-1.4C5.1 8.8 8.1 6 12 6s6.9 2.8 6.2 6.6L18 14c0 4.6-3 7.1-6 7.5Z" />
          <path d="M12 21.5v-10c0-1.5 1.5-3 3-3h.5c1.5 0 3 1.5 3 3v1" />
        </svg>
        <h1 className="error-title">Uh-oh!</h1>
        <p className="error-message">Something seems to be missing.</p>
        <p className="error-details">
          The page you're looking for might have been moved, deleted, or never
          existed. Let's get you back on track.
        </p>
        <button onClick={handleNavigateHome} className="home-button">
          <span className="home-button-bg"></span>
          <span className="home-button-text">Go Back Home</span>
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;
