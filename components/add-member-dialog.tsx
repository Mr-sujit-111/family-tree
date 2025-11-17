"use client";

import { useState, useEffect } from "react";
import * as React from "react";
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
import { apiClient } from "@/lib/api";
import Image from "next/image";
import { Upload, X, Plus } from "lucide-react";

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetMemberId?: string;
  targetMemberGender?: "male" | "female";
  relationType?: "child" | "parent" | "sibling" | "spouse";
  onSuccess?: () => void;
}

export function AddMemberDialog({
  open,
  onOpenChange,
  targetMemberId = "",
  targetMemberGender,
  relationType = "child",
  onSuccess,
}: AddMemberDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [mobileNumbers, setMobileNumbers] = useState<string[]>([""]);
  const [fetchedTargetGender, setFetchedTargetGender] = useState<"male" | "female" | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    gender: "male" as "male" | "female",
    birth_date: "",
    notes: "",
    relation: relationType,
    is_deceased: false,
    passed_away_date: "",
    anniversary_date: "",
  });
  const [spouseMobileNumbers, setSpouseMobileNumbers] = useState<string[]>([""]);

  // Fetch target member gender if not provided when adding spouse
  React.useEffect(() => {
    if (open && relationType === "spouse" && !targetMemberGender && targetMemberId) {
      const fetchGender = async () => {
        try {
          const response = await apiClient.getMemberById(targetMemberId);
          if (response.data?.gender) {
            setFetchedTargetGender(response.data.gender as "male" | "female");
          }
        } catch (err) {
          // Silently fail - will default to "male"
          console.error("Failed to fetch target member gender:", err);
        }
      };
      fetchGender();
    } else {
      setFetchedTargetGender(null);
    }
  }, [open, relationType, targetMemberGender, targetMemberId]);

  const addSpouseMobileNumber = () => {
    setSpouseMobileNumbers([...spouseMobileNumbers, ""]);
  };

  const removeSpouseMobileNumber = (index: number) => {
    setSpouseMobileNumbers(spouseMobileNumbers.filter((_, i) => i !== index));
  };

  const updateSpouseMobileNumber = (index: number, value: string) => {
    const updated = [...spouseMobileNumbers];
    updated[index] = value;
    setSpouseMobileNumbers(updated);
  };

  // Update formData when relationType changes and reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      // For spouse, automatically set opposite gender
      let defaultGender: "male" | "female" = "male";
      const genderToUse = targetMemberGender || fetchedTargetGender;
      if (relationType === "spouse" && genderToUse) {
        defaultGender = genderToUse === "male" ? "female" : "male";
      }
      
      setFormData({
        first_name: "",
        last_name: "",
        gender: defaultGender,
        birth_date: "",
        notes: "",
        relation: relationType,
        is_deceased: false,
        passed_away_date: "",
        anniversary_date: "",
      });
      setMobileNumbers([""]);
      setSpouseMobileNumbers([""]);
      setSelectedImage(null);
      setImagePreview(null);
      setError(null);
    }
  }, [relationType, open, targetMemberGender, fetchedTargetGender]);

  // Get dynamic labels based on relation type
  const getRelationLabels = () => {
    // If no targetMemberId, this is the first member (root member)
    if (!targetMemberId) {
      return {
        title: "Create Your Family Tree",
        description: "Add the first member to start building your family tree. This will be the root member.",
        genderHint: "Select the member's gender",
      };
    }

    switch (relationType) {
      case "parent":
        return {
          title: "Add Parent",
          description: "Add a parent to this family member. If the parent has a spouse, they will be added automatically.",
          genderHint: "Select the parent's gender",
        };
      case "child":
        return {
          title: "Add Child",
          description: "Add a child to this family member. You can add multiple children one by one.",
          genderHint: "Select the child's gender",
        };
      case "spouse":
        return {
          title: "Add Spouse",
          description: "Add a spouse/partner to this family member.",
          genderHint: "Select the spouse's gender",
        };
      case "sibling":
        return {
          title: "Add Sibling",
          description: "Add a sibling to this family member. They will share the same parents.",
          genderHint: "Select the sibling's gender",
        };
      default:
        return {
          title: "Add Family Member",
          description: "Add a new family member with a relationship.",
          genderHint: "Select the member's gender",
        };
    }
  };

  const labels = getRelationLabels();

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

  const addMobileNumber = () => {
    setMobileNumbers([...mobileNumbers, ""]);
  };

  const removeMobileNumber = (index: number) => {
    setMobileNumbers(mobileNumbers.filter((_, i) => i !== index));
  };

  const updateMobileNumber = (index: number, value: string) => {
    const updated = [...mobileNumbers];
    updated[index] = value;
    setMobileNumbers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // If adding spouse, update the target member with spouse object
      if (relationType === "spouse") {
        const validSpouseMobileNumbers = spouseMobileNumbers.filter((num) => num.trim() !== "");
        
        const updateData: any = {
          spouse: {
            first_name: formData.first_name,
            last_name: formData.last_name || undefined,
            gender: formData.gender,
            birth_date: formData.birth_date || undefined,
            notes: formData.notes || undefined,
            is_deceased: formData.is_deceased,
            passed_away_date: formData.passed_away_date || undefined,
            mobile_numbers: validSpouseMobileNumbers.length > 0 ? validSpouseMobileNumbers : undefined,
          },
        };

        // Add anniversary date if provided
        if (formData.anniversary_date) {
          updateData.anniversary_date = formData.anniversary_date;
        }

        const response = await apiClient.updateMember(targetMemberId, updateData);

        if (response.data) {
          // Upload spouse image if selected
          if (selectedImage) {
            await apiClient.uploadSpouseImage(targetMemberId, selectedImage);
          }

          onOpenChange(false);
          // Reset form
          setFormData({
            first_name: "",
            last_name: "",
            gender: "male",
            birth_date: "",
            notes: "",
            relation: relationType,
            is_deceased: false,
            passed_away_date: "",
            anniversary_date: "",
          });
          setMobileNumbers([""]);
          setSpouseMobileNumbers([""]);
          setSelectedImage(null);
          setImagePreview(null);
          if (onSuccess) {
            onSuccess();
          }
        } else {
          setError(
            typeof response.error === "string"
              ? response.error
              : "Failed to add spouse"
          );
        }
      } else {
        // For other relations (child, parent, sibling), create new member
        const validMobileNumbers = mobileNumbers.filter((num) => num.trim() !== "");

        const createData: any = {
          first_name: formData.first_name,
          last_name: formData.last_name || undefined,
          gender: formData.gender,
          birth_date: formData.birth_date || undefined,
          notes: formData.notes || undefined,
          is_deceased: formData.is_deceased,
          passed_away_date: formData.passed_away_date || undefined,
          mobile_numbers: validMobileNumbers.length > 0 ? validMobileNumbers : undefined,
        };

        // Only include relation and target_id if targetMemberId is provided (not the first member)
        if (targetMemberId) {
          createData.relation = formData.relation;
          createData.target_id = targetMemberId;
        }

        const response = await apiClient.createMember(createData);

        if (response.data) {
          // Upload image if selected
          if (selectedImage && response.data.id) {
            await apiClient.uploadMemberImage(response.data.id, selectedImage);
          }

          // If adding a child, store parent ID to auto-expand after reload
          if (relationType === "child" && targetMemberId) {
            sessionStorage.setItem("expand_parent_after_add", targetMemberId);
          }

          onOpenChange(false);
          // Reset form
          setFormData({
            first_name: "",
            last_name: "",
            gender: "male",
            birth_date: "",
            notes: "",
            relation: relationType,
            is_deceased: false,
            passed_away_date: "",
            anniversary_date: "",
          });
          setMobileNumbers([""]);
          setSpouseMobileNumbers([""]);
          setSelectedImage(null);
          setImagePreview(null);
          if (onSuccess) {
            onSuccess();
          }
        } else {
          setError(
            typeof response.error === "string"
              ? response.error
              : "Failed to create member"
          );
        }
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{labels.title}</DialogTitle>
          <DialogDescription>
            {labels.description}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name *</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
              required
              placeholder="Enter first name"
              className="select-text"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
              placeholder="Enter last name (optional)"
              className="select-text"
            />
          </div>

          <div className="space-y-2">
            <Label>{labels.genderHint} *</Label>
            <RadioGroup
              value={formData.gender}
              onValueChange={(value) =>
                setFormData({ ...formData, gender: value as "male" | "female" })
              }
              disabled={relationType === "spouse" && !!targetMemberId}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" disabled={relationType === "spouse" && !!targetMemberId} />
                <Label htmlFor="male" className={`select-text ${relationType === "spouse" && targetMemberId ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                  Male
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" disabled={relationType === "spouse" && !!targetMemberId} />
                <Label htmlFor="female" className={`select-text ${relationType === "spouse" && targetMemberId ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                  Female
                </Label>
              </div>
            </RadioGroup>
            {relationType === "spouse" && targetMemberId && (
              <p className="text-sm text-muted-foreground">
                Gender automatically set to opposite of target member
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="birth_date">Birth Date</Label>
            <Input
              id="birth_date"
              type="date"
              value={formData.birth_date}
              onChange={(e) =>
                setFormData({ ...formData, birth_date: e.target.value })
              }
              className="select-text"
            />
          </div>

          {relationType === "spouse" && targetMemberId && (
            <div className="space-y-2">
              <Label htmlFor="anniversary_date">Anniversary Date</Label>
              <Input
                id="anniversary_date"
                type="date"
                value={formData.anniversary_date}
                onChange={(e) =>
                  setFormData({ ...formData, anniversary_date: e.target.value })
                }
                className="select-text"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Additional information (optional)"
              rows={3}
              className="select-text"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="is_deceased" className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                id="is_deceased"
                checked={formData.is_deceased}
                onChange={(e) =>
                  setFormData({ ...formData, is_deceased: e.target.checked })
                }
                className="h-4 w-4"
              />
              <span>Mark as deceased</span>
            </Label>
          </div>

          {formData.is_deceased && (
            <div className="space-y-2">
              <Label htmlFor="passed_away_date">Date of Passing</Label>
              <Input
                id="passed_away_date"
                type="date"
                value={formData.passed_away_date}
                onChange={(e) =>
                  setFormData({ ...formData, passed_away_date: e.target.value })
                }
                className="select-text"
              />
            </div>
          )}

          {relationType !== "spouse" && (
            <div className="space-y-2">
              <Label>Mobile Numbers</Label>
              {mobileNumbers.map((num, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={num}
                    onChange={(e) => updateMobileNumber(index, e.target.value)}
                    placeholder="Enter mobile number"
                    type="tel"
                    className="select-text"
                  />
                  {mobileNumbers.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeMobileNumber(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMobileNumber}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Mobile Number
              </Button>
            </div>
          )}

          {relationType === "spouse" && (
            <div className="space-y-2">
              <Label>Spouse Mobile Numbers</Label>
              {spouseMobileNumbers.map((num, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={num}
                    onChange={(e) => updateSpouseMobileNumber(index, e.target.value)}
                    placeholder="Enter mobile number"
                    type="tel"
                    className="select-text"
                  />
                  {spouseMobileNumbers.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSpouseMobileNumber(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSpouseMobileNumber}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Mobile Number
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="image">
              {relationType === "spouse" ? "Spouse Profile Photo" : "Profile Photo"}
            </Label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-border">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <label
                htmlFor="image"
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span className="text-sm">
                  {imagePreview ? "Change Photo" : "Upload Photo"}
                </span>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
              {error}
            </div>
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
              {isLoading 
                ? (relationType === "spouse" ? "Adding Spouse..." : "Adding...") 
                : (relationType === "spouse" ? "Add Spouse" : "Add Member")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
