"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { apiClient } from "@/lib/api";
import Image from "next/image";
import { Upload, X, Plus, User, Heart } from "lucide-react";

interface EditMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  isEditingSpouse?: boolean; // Keep for backward compatibility, but will use tabs instead
  memberData?: {
    first_name: string;
    last_name?: string;
    birth_date?: string;
    notes?: string;
    anniversary_date?: string;
    is_deceased?: boolean;
    passed_away_date?: string;
    mobile_numbers?: string[];
    image_path?: string;
    gender?: string;
    spouse?: {
      first_name: string;
      last_name?: string;
      gender: string;
      birth_date?: string;
      image_path?: string;
      notes?: string;
      is_deceased?: boolean;
      passed_away_date?: string;
      mobile_numbers?: string[];
    };
  };
  onSuccess?: () => void;
}

export function EditMemberDialog({
  open,
  onOpenChange,
  memberId,
  isEditingSpouse = false,
  memberData,
  onSuccess,
}: EditMemberDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingSpouseImage, setIsUploadingSpouseImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("member");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [spouseImagePreview, setSpouseImagePreview] = useState<string | null>(null);
  const [selectedSpouseImage, setSelectedSpouseImage] = useState<File | null>(null);
  const [mobileNumbers, setMobileNumbers] = useState<string[]>([""]);
  const [spouseMobileNumbers, setSpouseMobileNumbers] = useState<string[]>([""]);
  const [memberFormData, setMemberFormData] = useState({
    first_name: "",
    last_name: "",
    birth_date: "",
    notes: "",
    anniversary_date: "",
    is_deceased: false,
    passed_away_date: "",
  });
  const [spouseFormData, setSpouseFormData] = useState({
    first_name: "",
    last_name: "",
    birth_date: "",
    notes: "",
    is_deceased: false,
    passed_away_date: "",
  });

  useEffect(() => {
    if (memberData && open) {
      // Initialize member form data
      setMemberFormData({
        first_name: memberData.first_name || "",
        last_name: memberData.last_name || "",
        birth_date: memberData.birth_date || "",
        notes: memberData.notes || "",
        anniversary_date: memberData.anniversary_date || "",
        is_deceased: memberData.is_deceased || false,
        passed_away_date: memberData.passed_away_date || "",
      });
      
      // Initialize spouse form data if spouse exists
      if (memberData.spouse) {
        setSpouseFormData({
          first_name: memberData.spouse.first_name || "",
          last_name: memberData.spouse.last_name || "",
          birth_date: memberData.spouse.birth_date || "",
          notes: memberData.spouse.notes || "",
          is_deceased: memberData.spouse.is_deceased || false,
          passed_away_date: memberData.spouse.passed_away_date || "",
        });
        
        if (memberData.spouse.mobile_numbers && memberData.spouse.mobile_numbers.length > 0) {
          setSpouseMobileNumbers(memberData.spouse.mobile_numbers);
        } else {
          setSpouseMobileNumbers([""]);
        }
      } else {
        setSpouseFormData({
          first_name: "",
          last_name: "",
          birth_date: "",
          notes: "",
          is_deceased: false,
          passed_away_date: "",
        });
        setSpouseMobileNumbers([""]);
      }
      
      // Set member mobile numbers
      if (memberData.mobile_numbers && memberData.mobile_numbers.length > 0) {
        setMobileNumbers(memberData.mobile_numbers);
      } else {
        setMobileNumbers([""]);
      }
      
      // Reset image states
      setImagePreview(null);
      setSelectedImage(null);
      setSpouseImagePreview(null);
      setSelectedSpouseImage(null);
      
      // Set active tab based on isEditingSpouse prop (for backward compatibility)
      if (isEditingSpouse && memberData.spouse) {
        setActiveTab("spouse");
      } else {
        setActiveTab("member");
      }
    }
  }, [memberData, open, isEditingSpouse]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleSpouseImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      setSelectedSpouseImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSpouseImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    setIsUploadingImage(true);
    setError(null);

    try {
      const response = await apiClient.uploadMemberImage(memberId, selectedImage);
      
      if (response.data) {
        setSelectedImage(null);
        setImagePreview(null);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(response.error || "Failed to upload image");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSpouseImageUpload = async () => {
    if (!selectedSpouseImage) return;

    setIsUploadingSpouseImage(true);
    setError(null);

    try {
      const response = await apiClient.uploadSpouseImage(memberId, selectedSpouseImage);
      
      if (response.data) {
        setSelectedSpouseImage(null);
        setSpouseImagePreview(null);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(response.error || "Failed to upload spouse image");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setIsUploadingSpouseImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const validMemberMobileNumbers = mobileNumbers.filter((num) => num.trim() !== "");
      const validSpouseMobileNumbers = spouseMobileNumbers.filter((num) => num.trim() !== "");

      // Build update data with both member and spouse (if exists)
      const updateData: any = {
        first_name: memberFormData.first_name,
        last_name: memberFormData.last_name || undefined,
        birth_date: memberFormData.birth_date || undefined,
        notes: memberFormData.notes || undefined,
        is_deceased: memberFormData.is_deceased,
        passed_away_date: memberFormData.passed_away_date || undefined,
        mobile_numbers: validMemberMobileNumbers.length > 0 ? validMemberMobileNumbers : undefined,
      };

      // Include anniversary date if member has spouse
      if (memberData?.spouse) {
        updateData.anniversary_date = memberFormData.anniversary_date || undefined;
      }

      // Include spouse data if spouse exists
      if (memberData?.spouse) {
        // Determine spouse gender: use existing spouse gender, or set to opposite of member's gender
        let spouseGender: "male" | "female" = "female"; // default
        
        if (memberData.spouse.gender) {
          // Use existing spouse gender
          spouseGender = memberData.spouse.gender.toLowerCase() as "male" | "female";
        } else if (memberData.gender) {
          // Set to opposite of member's gender
          const memberGender = memberData.gender.toLowerCase();
          spouseGender = memberGender === "male" ? "female" : "male";
        }
        
        updateData.spouse = {
          first_name: spouseFormData.first_name,
          last_name: spouseFormData.last_name || undefined,
          gender: spouseGender,
          birth_date: spouseFormData.birth_date || undefined,
          notes: spouseFormData.notes || undefined,
          is_deceased: spouseFormData.is_deceased,
          passed_away_date: spouseFormData.passed_away_date || undefined,
          mobile_numbers: validSpouseMobileNumbers.length > 0 ? validSpouseMobileNumbers : undefined,
        };
      }

      const response = await apiClient.updateMember(memberId, updateData);

      if (response.data) {
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(
          typeof response.error === "string"
            ? response.error
            : "Failed to update member"
        );
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const renderMemberForm = () => (
    <div className="space-y-4">
      {/* Member Image Upload Section */}
      <div className="space-y-2">
        <Label>Profile Image</Label>
        <div className="flex flex-col gap-3">
          <div className="relative h-32 w-32 mx-auto overflow-hidden rounded-full border-2 border-primary">
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="object-cover"
              />
            ) : memberData?.image_path ? (
              <Image
                src={
                  memberData.image_path.startsWith("http")
                    ? memberData.image_path
                    : `${
                        process.env.NEXT_PUBLIC_API_URL ||
                        "http://localhost:8000"
                      }${memberData.image_path.startsWith("/") ? "" : "/"}${
                        memberData.image_path
                      }`
                }
                alt="Current"
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-muted flex items-center justify-center">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="flex-1"
              disabled={isUploadingImage}
            />
            {selectedImage && (
              <Button
                type="button"
                onClick={handleImageUpload}
                disabled={isUploadingImage}
                size="sm"
              >
                {isUploadingImage ? "Uploading..." : "Upload"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit_first_name">First Name *</Label>
        <Input
          id="edit_first_name"
          value={memberFormData.first_name}
          onChange={(e) =>
            setMemberFormData({ ...memberFormData, first_name: e.target.value })
          }
          required
          minLength={1}
          maxLength={50}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit_last_name">Last Name</Label>
        <Input
          id="edit_last_name"
          value={memberFormData.last_name}
          onChange={(e) =>
            setMemberFormData({ ...memberFormData, last_name: e.target.value })
          }
          maxLength={50}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit_birth_date">Birth Date</Label>
        <Input
          id="edit_birth_date"
          type="date"
          value={memberFormData.birth_date}
          onChange={(e) =>
            setMemberFormData({ ...memberFormData, birth_date: e.target.value })
          }
        />
      </div>

      {memberData?.spouse && (
        <div className="space-y-2">
          <Label htmlFor="edit_anniversary_date">Anniversary Date</Label>
          <Input
            id="edit_anniversary_date"
            type="date"
            value={memberFormData.anniversary_date}
            onChange={(e) =>
              setMemberFormData({
                ...memberFormData,
                anniversary_date: e.target.value,
              })
            }
          />
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Mobile Numbers</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setMobileNumbers([...mobileNumbers, ""])}
            className="h-7 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
        {mobileNumbers.map((number, index) => (
          <div key={index} className="flex gap-2">
            <Input
              type="tel"
              value={number}
              onChange={(e) => {
                const updated = [...mobileNumbers];
                updated[index] = e.target.value;
                setMobileNumbers(updated);
              }}
              maxLength={20}
              placeholder="+1234567890"
            />
            {mobileNumbers.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMobileNumbers(mobileNumbers.filter((_, i) => i !== index))}
                className="px-2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <RadioGroup
          value={memberFormData.is_deceased ? "deceased" : "living"}
          onValueChange={(value) =>
            setMemberFormData({
              ...memberFormData,
              is_deceased: value === "deceased",
            })
          }
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="living" id="member_living" />
            <Label htmlFor="member_living" className="font-normal cursor-pointer">
              Living
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="deceased" id="member_deceased" />
            <Label
              htmlFor="member_deceased"
              className="font-normal cursor-pointer"
            >
              Deceased
            </Label>
          </div>
        </RadioGroup>
      </div>

      {memberFormData.is_deceased && (
        <div className="space-y-2">
          <Label htmlFor="edit_passed_away_date">Passed Away Date</Label>
          <Input
            id="edit_passed_away_date"
            type="date"
            value={memberFormData.passed_away_date}
            onChange={(e) =>
              setMemberFormData({
                ...memberFormData,
                passed_away_date: e.target.value,
              })
            }
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="edit_notes">Notes</Label>
        <Textarea
          id="edit_notes"
          value={memberFormData.notes}
          onChange={(e) =>
            setMemberFormData({ ...memberFormData, notes: e.target.value })
          }
          maxLength={500}
          rows={3}
        />
      </div>
    </div>
  );

  const renderSpouseForm = () => (
    <div className="space-y-4">
      {/* Spouse Image Upload Section */}
      <div className="space-y-2">
        <Label>Spouse Profile Image</Label>
        <div className="flex flex-col gap-3">
          <div className="relative h-32 w-32 mx-auto overflow-hidden rounded-full border-2 border-primary">
            {spouseImagePreview ? (
              <Image
                src={spouseImagePreview}
                alt="Preview"
                fill
                className="object-cover"
              />
            ) : memberData?.spouse?.image_path ? (
              <Image
                src={
                  memberData.spouse.image_path.startsWith("http")
                    ? memberData.spouse.image_path
                    : `${
                        process.env.NEXT_PUBLIC_API_URL ||
                        "http://localhost:8000"
                      }${memberData.spouse.image_path.startsWith("/") ? "" : "/"}${
                        memberData.spouse.image_path
                      }`
                }
                alt="Current"
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-muted flex items-center justify-center">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleSpouseImageChange}
              className="flex-1"
              disabled={isUploadingSpouseImage}
            />
            {selectedSpouseImage && (
              <Button
                type="button"
                onClick={handleSpouseImageUpload}
                disabled={isUploadingSpouseImage}
                size="sm"
              >
                {isUploadingSpouseImage ? "Uploading..." : "Upload"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit_spouse_first_name">First Name *</Label>
        <Input
          id="edit_spouse_first_name"
          value={spouseFormData.first_name}
          onChange={(e) =>
            setSpouseFormData({ ...spouseFormData, first_name: e.target.value })
          }
          required
          minLength={1}
          maxLength={50}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit_spouse_last_name">Last Name</Label>
        <Input
          id="edit_spouse_last_name"
          value={spouseFormData.last_name}
          onChange={(e) =>
            setSpouseFormData({ ...spouseFormData, last_name: e.target.value })
          }
          maxLength={50}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit_spouse_birth_date">Birth Date</Label>
        <Input
          id="edit_spouse_birth_date"
          type="date"
          value={spouseFormData.birth_date}
          onChange={(e) =>
            setSpouseFormData({ ...spouseFormData, birth_date: e.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Mobile Numbers</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSpouseMobileNumbers([...spouseMobileNumbers, ""])}
            className="h-7 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
        {spouseMobileNumbers.map((number, index) => (
          <div key={index} className="flex gap-2">
            <Input
              type="tel"
              value={number}
              onChange={(e) => {
                const updated = [...spouseMobileNumbers];
                updated[index] = e.target.value;
                setSpouseMobileNumbers(updated);
              }}
              maxLength={20}
              placeholder="+1234567890"
            />
            {spouseMobileNumbers.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSpouseMobileNumbers(spouseMobileNumbers.filter((_, i) => i !== index))}
                className="px-2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <RadioGroup
          value={spouseFormData.is_deceased ? "deceased" : "living"}
          onValueChange={(value) =>
            setSpouseFormData({
              ...spouseFormData,
              is_deceased: value === "deceased",
            })
          }
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="living" id="spouse_living" />
            <Label htmlFor="spouse_living" className="font-normal cursor-pointer">
              Living
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="deceased" id="spouse_deceased" />
            <Label
              htmlFor="spouse_deceased"
              className="font-normal cursor-pointer"
            >
              Deceased
            </Label>
          </div>
        </RadioGroup>
      </div>

      {spouseFormData.is_deceased && (
        <div className="space-y-2">
          <Label htmlFor="edit_spouse_passed_away_date">Passed Away Date</Label>
          <Input
            id="edit_spouse_passed_away_date"
            type="date"
            value={spouseFormData.passed_away_date}
            onChange={(e) =>
              setSpouseFormData({
                ...spouseFormData,
                passed_away_date: e.target.value,
              })
            }
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="edit_spouse_notes">Notes</Label>
        <Textarea
          id="edit_spouse_notes"
          value={spouseFormData.notes}
          onChange={(e) =>
            setSpouseFormData({ ...spouseFormData, notes: e.target.value })
          }
          maxLength={500}
          rows={3}
        />
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Family Member</DialogTitle>
          <DialogDescription>
            {memberData?.spouse
              ? "Update member and spouse information"
              : "Update member information"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          {memberData?.spouse ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="member" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Member
                </TabsTrigger>
                <TabsTrigger value="spouse" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Spouse
                </TabsTrigger>
              </TabsList>
              <TabsContent value="member" className="mt-4">
                {renderMemberForm()}
              </TabsContent>
              <TabsContent value="spouse" className="mt-4">
                {renderSpouseForm()}
              </TabsContent>
            </Tabs>
          ) : (
            <div>{renderMemberForm()}</div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
