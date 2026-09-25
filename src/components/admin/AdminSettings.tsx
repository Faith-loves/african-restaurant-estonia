"use client";

import type {
  ComponentType,
} from "react";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signOut,
  updatePassword,
} from "firebase/auth";

import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import {
  ArrowLeft,
  AtSign,
  Check,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  Settings,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  auth,
  db,
} from "@/lib/firebase/client";

type RestaurantSettings = {
  restaurantName: string;
  tagline: string;
  secondaryPhrase: string;
  description: string;
  publicEmail: string;
  phone: string;
  instagram: string;
  address: string;
};

const defaultSettings: RestaurantSettings = {
  restaurantName:
    "African Restaurant Estonia",

  tagline:
    "A Taste of West Africa, Right Here.",

  secondaryPhrase:
    "Tastes like Love, Tastes Heavenly",

  description:
    "Authentic Nigerian & West African food in Tallinn",

  publicEmail:
    "africanrestaurantestonia@gmail.com",

  phone:
    "53078208",

  instagram:
    "@AFRICANRESTAURANTESTONIA",

  address:
    "NELGI 30, 11213, TALLINN",
};

export default function AdminSettings() {
  const router =
    useRouter();

  const [
    authorized,
    setAuthorized,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    changingPassword,
    setChangingPassword,
  ] = useState(false);

  const [
    settings,
    setSettings,
  ] =
    useState<RestaurantSettings>(
      defaultSettings
    );

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {
          if (!user) {
            router.replace(
              "/login"
            );

            return;
          }

          try {
            const adminSnapshot =
              await getDoc(
                doc(
                  db,
                  "admins",
                  user.uid
                )
              );

            if (
              !adminSnapshot.exists()
            ) {
              await signOut(
                auth
              );

              router.replace(
                "/login"
              );

              return;
            }

            const adminData =
              adminSnapshot.data();

            if (
              adminData.role !== "admin" &&
              adminData.role !== "owner" ||
              adminData.active !==
                true
            ) {
              await signOut(
                auth
              );

              router.replace(
                "/login"
              );

              return;
            }

            setAuthorized(
              true
            );
          } catch (
            authError
          ) {
            console.error(
              "Settings admin verification error:",
              authError
            );

            setError(
              "Unable to verify administrator access."
            );

            setLoading(
              false
            );
          }
        }
      );

    return () => {
      unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (!authorized) {
      return;
    }

    const settingsReference =
      doc(
        db,
        "settings",
        "public"
      );

    const unsubscribe =
      onSnapshot(
        settingsReference,
        (snapshot) => {
          if (
            snapshot.exists()
          ) {
            const data =
              snapshot.data();

            setSettings({
              restaurantName:
                typeof data.restaurantName ===
                "string"
                  ? data.restaurantName
                  : defaultSettings.restaurantName,

              tagline:
                typeof data.tagline ===
                "string"
                  ? data.tagline
                  : defaultSettings.tagline,

              secondaryPhrase:
                typeof data.secondaryPhrase ===
                "string"
                  ? data.secondaryPhrase
                  : defaultSettings.secondaryPhrase,

              description:
                typeof data.description ===
                "string"
                  ? data.description
                  : defaultSettings.description,

              publicEmail:
                typeof data.publicEmail ===
                "string"
                  ? data.publicEmail
                  : defaultSettings.publicEmail,

              phone:
                typeof data.phone ===
                "string"
                  ? data.phone
                  : defaultSettings.phone,

              instagram:
                typeof data.instagram ===
                "string"
                  ? data.instagram
                  : defaultSettings.instagram,

              address:
                typeof data.address ===
                "string"
                  ? data.address
                  : defaultSettings.address,
            });
          } else {
            setSettings(
              defaultSettings
            );
          }

          setLoading(
            false
          );
        },
        (snapshotError) => {
          console.error(
            "Settings Firestore error:",
            snapshotError
          );

          setError(
            "Unable to load restaurant settings."
          );

          setLoading(
            false
          );
        }
      );

    return () => {
      unsubscribe();
    };
  }, [authorized]);

  function updateField(
    field:
      keyof RestaurantSettings,
    value: string
  ) {
    setSuccess("");

    setSettings(
      (current) => ({
        ...current,

        [field]:
          value,
      })
    );
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !settings.restaurantName.trim() ||
      !settings.publicEmail.trim() ||
      !settings.phone.trim() ||
      !settings.address.trim()
    ) {
      setError(
        "Restaurant name, email, phone and address are required."
      );

      return;
    }

    setSaving(
      true
    );

    try {
      await setDoc(
        doc(
          db,
          "settings",
          "public"
        ),
        {
          restaurantName:
            settings.restaurantName.trim(),

          tagline:
            settings.tagline.trim(),

          secondaryPhrase:
            settings.secondaryPhrase.trim(),

          description:
            settings.description.trim(),

          publicEmail:
            settings.publicEmail.trim(),

          phone:
            settings.phone.trim(),

          instagram:
            settings.instagram.trim(),

          address:
            settings.address.trim(),

          updatedAt:
            serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      setSuccess(
        "Restaurant settings saved successfully."
      );
    } catch (
      saveError
    ) {
      console.error(
        "Restaurant settings save error:",
        saveError
      );

      setError(
        "Restaurant settings could not be saved."
      );
    } finally {
      setSaving(
        false
      );
    }
  }

  async function handlePasswordChange(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("The new password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("The new passwords do not match.");
      return;
    }

    const user = auth.currentUser;
    if (!user?.email) {
      setError("Your signed-in admin account could not be found.");
      return;
    }

    setChangingPassword(true);

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Your administrator password was changed successfully.");
    } catch (passwordError) {
      console.error("Admin password change error:", passwordError);

      const code = (passwordError as { code?: string }).code;
      setError(
        code === "auth/wrong-password" || code === "auth/invalid-credential"
          ? "The current password is incorrect."
          : code === "auth/requires-recent-login"
            ? "Please sign in again before changing your password."
            : "The administrator password could not be changed."
      );
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFF8EC]">

        <div className="text-center">

          <Loader2 className="mx-auto h-9 w-9 animate-spin text-[#321B29]" />

          <p className="mt-4 text-sm font-bold text-[#321B29]/60">
            Loading restaurant settings...
          </p>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF8EC]">

      <header className="border-b border-[#321B29]/10 bg-white">

        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-5 py-5 sm:px-8 lg:px-12">

          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin"
              )
            }
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#321B29]/10 text-[#321B29] transition hover:bg-[#321B29] hover:text-white"
            aria-label="Back to dashboard"
          >
            <ArrowLeft
              size={18}
            />
          </button>

          <div className="min-w-0">

            <p className="truncate text-xs font-extrabold uppercase tracking-[0.18em] text-[#B9472E]">
              African Restaurant Estonia
            </p>

            <h1 className="font-[var(--font-cormorant)] text-3xl font-bold text-[#321B29]">
              Settings
            </h1>

          </div>

        </div>

      </header>

      <section className="mx-auto max-w-[1000px] px-5 py-8 sm:px-8 lg:px-12">

        <div className="rounded-[26px] bg-[#321B29] p-6 text-white sm:p-8">

          <Settings
            size={25}
            className="text-[#D89A27]"
          />

          <h2 className="mt-4 font-[var(--font-cormorant)] text-4xl font-bold sm:text-5xl">
            Restaurant Information
          </h2>

          <p className="mt-2 max-w-[650px] text-sm font-semibold leading-7 text-white/60">
            Update the public information customers see across the African Restaurant Estonia website.
          </p>

        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-[#B9472E]/20 bg-[#B9472E]/10 p-4 text-sm font-bold text-[#B9472E]">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-green-700/15 bg-green-50 p-4 text-sm font-bold text-green-800">

            <Check
              size={18}
            />

            {success}

          </div>
        )}

        <form
          onSubmit={
            handleSubmit
          }
          className="mt-7 rounded-[24px] border border-[#321B29]/10 bg-white p-5 shadow-[0_8px_30px_rgba(50,27,41,0.05)] sm:p-7"
        >

          <SettingsField
            label="Restaurant Name"
            value={
              settings.restaurantName
            }
            onChange={(value) =>
              updateField(
                "restaurantName",
                value
              )
            }
            required
          />

          <div className="mt-5">

            <SettingsField
              label="Main Tagline"
              value={
                settings.tagline
              }
              onChange={(value) =>
                updateField(
                  "tagline",
                  value
                )
              }
            />

          </div>

          <div className="mt-5">

            <SettingsField
              label="Secondary Phrase"
              value={
                settings.secondaryPhrase
              }
              onChange={(value) =>
                updateField(
                  "secondaryPhrase",
                  value
                )
              }
            />

          </div>

          <div className="mt-5">

            <label className="mb-2 block text-sm font-bold text-[#321B29]">
              Restaurant Description
            </label>

            <textarea
              rows={4}
              value={
                settings.description
              }
              onChange={(
                event
              ) =>
                updateField(
                  "description",
                  event.target.value
                )
              }
              className="admin-input no-scrollbar resize-none"
            />

          </div>

          <div className="my-7 h-px bg-[#321B29]/10" />

          <div className="grid gap-5 sm:grid-cols-2">

            <SettingsField
              label="Public Email"
              type="email"
              icon={
                Mail
              }
              value={
                settings.publicEmail
              }
              onChange={(value) =>
                updateField(
                  "publicEmail",
                  value
                )
              }
              required
            />

            <SettingsField
              label="Phone Number"
              type="tel"
              icon={
                Phone
              }
              value={
                settings.phone
              }
              onChange={(value) =>
                updateField(
                  "phone",
                  value
                )
              }
              required
            />

            <SettingsField
              label="Instagram"
              icon={
                AtSign
              }
              value={
                settings.instagram
              }
              onChange={(value) =>
                updateField(
                  "instagram",
                  value
                )
              }
            />

            <SettingsField
              label="Restaurant Address"
              icon={
                MapPin
              }
              value={
                settings.address
              }
              onChange={(value) =>
                updateField(
                  "address",
                  value
                )
              }
              required
            />

          </div>

          <div className="mt-7 rounded-2xl border border-[#D89A27]/25 bg-[#D89A27]/10 p-4">

            <p className="text-sm font-bold leading-6 text-[#321B29]">
              Private order email addresses, Firebase credentials, Cloudinary keys and other secrets are never stored in this public settings document.
            </p>

          </div>

          <button
            type="submit"
            disabled={
              saving
            }
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#321B29] px-6 py-4 text-sm font-extrabold text-white transition hover:bg-[#D89A27] hover:text-[#321B29] disabled:cursor-wait disabled:opacity-50"
          >

            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />

                Saving Settings...
              </>
            ) : (
              <>
                <Save
                  size={17}
                />

                Save Settings
              </>
            )}

          </button>

        </form>

        <form
          onSubmit={handlePasswordChange}
          className="mt-7 rounded-[24px] border border-[#321B29]/10 bg-white p-5 shadow-[0_8px_30px_rgba(50,27,41,0.05)] sm:p-7"
        >
          <div>
            <h2 className="font-[var(--font-cormorant)] text-3xl font-bold text-[#321B29]">
              Change Administrator Password
            </h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#151313]/55">
              Confirm your current password before choosing a new one for this signed-in admin account.
            </p>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <SettingsField
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={setCurrentPassword}
              required
            />
            <SettingsField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              required
            />
            <SettingsField
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              required
            />
          </div>

          <button
            type="submit"
            disabled={changingPassword}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-[#321B29] px-6 py-4 text-sm font-extrabold text-[#321B29] transition hover:bg-[#321B29] hover:text-white disabled:cursor-wait disabled:opacity-50"
          >
            {changingPassword ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Changing Password...
              </>
            ) : (
              "Change Password"
            )}
          </button>
        </form>

      </section>

    </main>
  );
}

type SettingsFieldProps = {
  label: string;
  value: string;

  onChange:
    (value: string) => void;

  type?: string;
  required?: boolean;

  icon?: ComponentType<{
    size?: number;
  }>;
};

function SettingsField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  icon: Icon,
}: SettingsFieldProps) {
  return (
    <div>

      <label className="mb-2 flex items-center gap-2 text-sm font-bold text-[#321B29]">

        {Icon && (
          <Icon
            size={15}
          />
        )}

        {label}

      </label>

      <input
        type={type}
        value={value}
        required={
          required
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        className="admin-input"
      />

    </div>
  );
}
