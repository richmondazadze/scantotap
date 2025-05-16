
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-scan-blue border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-lg">Redirecting...</p>
      </div>
    </div>
  );
};

export default Index;
