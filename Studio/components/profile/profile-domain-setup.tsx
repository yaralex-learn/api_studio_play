import { InfoIcon, SaveIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function ProfileDomainSetup() {
  const [formData, setFormData] = useState({ domain: "" });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold">Domain Setup</h2>
          <p className="text-xs text-muted-foreground">
            Enter your domain below.
          </p>
        </div>

        <Button disabled={formData.domain.trim().length === 0}>
          <SaveIcon className="h-4 w-4" />
          Save
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="domain">Domain</Label>
          <Input
            id="domain"
            name="domain"
            type="url"
            placeholder="Enter your domain"
            autoCapitalize="none"
            value={formData.domain}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="flex flex-row items-start gap-2 text-sm text-blue-400">
          <InfoIcon className="w-5 h-5" />
          After registering the domain, the domain will be checked and the
          result will be sent to your email address along with the Yaralex DNS.
          This process may take between 24 and 72 hours!
        </div>
      </div>
    </div>
  );
}
