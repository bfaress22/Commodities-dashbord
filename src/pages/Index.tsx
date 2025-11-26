
import { useState, useEffect } from "react";
import CommoditiesDashboard from "@/components/CommoditiesDashboard";
import ApiKeyForm from "@/components/ApiKeyForm";
import { validateApiKey, updateApiKey } from "@/services/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_KEY = "Mhb1Gpa9jcM1WDHYKmfhjw==qcK3Oib7hEScQf8h";

const Index = () => {
  // On considère la clé comme toujours valide
  const [isKeyValid] = useState(true);
  const [showForm] = useState(false);

  // On injecte la clé directement dans le service
  updateApiKey(API_KEY);

  return (
    <div className="container mx-auto py-8 px-4">
      <CommoditiesDashboard />
    </div>
  );
};

export default Index;
