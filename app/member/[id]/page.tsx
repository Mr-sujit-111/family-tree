"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart, Upload } from "lucide-react";
import { formatDate, getAge, getYearsMarried } from "@/lib/date-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Member {
  id: string;
  first_name: string;
  last_name?: string;
  gender: string;
  birth_date?: string;
  notes?: string;
  image_path?: string;
  mobile_numbers?: string[];
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
  children?: Member[];
}

export default function MemberPage({ params }: { params: { id: string } }) {
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMember();
    }
  }, [params.id, isAuthenticated]);

  const fetchMember = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getMemberById(params.id);

      if (response.data) {
        setMember(response.data);
      } else {
        setError(response.error || "Member not found");
      }
    } catch (err) {
      setError("Failed to load member");
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleImageUpload = async () => {
    if (!selectedImage || !member) return;

    setIsUploadingImage(true);
    setError(null);

    try {
      const response = await apiClient.uploadMemberImage(
        member.id,
        selectedImage
      );
      if (response.data) {
        setSelectedImage(null);
        setImagePreview(null);
        fetchMember(); // Refresh member data
      } else {
        setError(response.error || "Failed to upload image");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading member...</p>
        </div>
      </main>
    );
  }

  if (error || !member) {
    return (
      <main className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Tree
            </Link>
          </div>
        </header>
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 text-center">
          <p className="text-destructive">{error || "Member not found"}</p>
        </div>
      </main>
    );
  }

  const memberName = `${member.first_name}${
    member.last_name ? " " + member.last_name : ""
  }`;
  const age = getAge(member.birth_date);

  // Handle image path - backend returns relative path
  const imageUrl = member.image_path
    ? member.image_path.startsWith("http")
      ? member.image_path
      : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${
          member.image_path.startsWith("/") ? "" : "/"
        }${member.image_path}`
    : "/placeholder.svg";

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tree
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-foreground">{memberName}</h1>
            <p className="text-muted-foreground mt-1">
              {typeof age === "number" ? `${age} years old` : age}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Sidebar - Images */}
          <div className="flex flex-col gap-6 md:col-span-1">
            {/* Main Image */}
            <div className="space-y-3">
              <div className="relative h-80 w-full overflow-hidden rounded-lg border-2 border-primary">
                <Image
                  src={imagePreview || imageUrl}
                  alt={memberName}
                  fill
                  className="object-cover"
                />
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
                    onClick={handleImageUpload}
                    disabled={isUploadingImage}
                    size="sm"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploadingImage ? "Uploading..." : "Upload"}
                  </Button>
                )}
              </div>
            </div>

            {/* Spouse Image */}
            {member.spouse && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-muted-foreground">
                  Spouse
                </p>
                <div className="relative h-48 w-full overflow-hidden rounded-lg border border-border">
                  <Image
                    src={member.spouse.image_path || "/placeholder.svg"}
                    alt={member.spouse.first_name || "Spouse"}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex flex-col gap-8 md:col-span-2">
            {/* Basic Info */}
            <div className="space-y-4 border-b border-border pb-8">
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">
                  Birth Date
                </p>
                <p className="text-lg text-foreground">
                  {formatDate(member.birth_date)}
                </p>
              </div>

              {member.spouse && (
                <>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1 flex items-center gap-2">
                      <Heart className="h-4 w-4 text-primary" />
                      Spouse
                    </p>
                    <p className="text-lg text-foreground">
                      {member.spouse.first_name} {member.spouse.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Born: {formatDate(member.spouse.birth_date)}
                    </p>
                  </div>
                </>
              )}

              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">
                  Gender
                </p>
                <p className="text-lg text-foreground capitalize">
                  {member.gender}
                </p>
              </div>

              {member.mobile_numbers && member.mobile_numbers.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">
                    Mobile {member.mobile_numbers.length > 1 ? "Numbers" : "Number"}
                  </p>
                  {member.mobile_numbers.map((number, index) => (
                    <p key={index} className="text-lg text-foreground">
                      {number}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            {member.notes && (
              <div className="space-y-2 border-b border-border pb-8">
                <p className="text-sm font-semibold text-muted-foreground">
                  About
                </p>
                <p className="text-foreground leading-relaxed">
                  {member.notes}
                </p>
              </div>
            )}

            {/* Children */}
            {member.children && member.children.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-muted-foreground">
                  Children ({member.children.length})
                </p>
                <div className="grid gap-3">
                  {member.children.map((child) => {
                    const childName = `${child.first_name}${
                      child.last_name ? " " + child.last_name : ""
                    }`;
                    return (
                      <Link
                        key={child.id}
                        href={`/member/${child.id}`}
                        className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted transition-colors group"
                      >
                        <div className="relative h-12 w-12 overflow-hidden rounded-full border border-primary">
                          <Image
                            src={
                              child.image_path
                                ? child.image_path.startsWith("http")
                                  ? child.image_path
                                  : `${
                                      process.env.NEXT_PUBLIC_API_URL ||
                                      "http://localhost:8000"
                                    }${
                                      child.image_path.startsWith("/")
                                        ? ""
                                        : "/"
                                    }${child.image_path}`
                                : "/placeholder.svg"
                            }
                            alt={childName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {childName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {typeof getAge(child.birth_date) === "number" 
                              ? `${getAge(child.birth_date)} years old` 
                              : getAge(child.birth_date)}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
