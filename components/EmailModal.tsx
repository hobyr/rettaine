"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Flashcard = {
  account_number: string;
  account_name: string;
};

type AccountInfo = {
  account_name: string;
  type: string | null;
  region: string | null;
  contact_email: string | null;
  contact_firstname: string | null;
};

type EmailAction = {
  product_sku: string;
  product_name: string;
  email_subject: string;
  email_body: string;
};

type RecommendedAction = {
  action_type: string;
  product_sku: string | null;
  product_name: string | null;
  email_subject: string | null;
  email_body: string | null;
};

function substitutePrenom(text: string, firstname: string | null): string {
  if (!firstname) return text;
  return text.replace(/\[Prénom\]/g, firstname);
}

export default function EmailModal({
  open,
  flashcard,
  onClose,
}: {
  open: boolean;
  flashcard: Flashcard | null;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [emailActions, setEmailActions] = useState<EmailAction[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (!open || !flashcard) return;

    const supabase = createClient();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setEmailActions([]);
    setSelectedIndex(0);
    setSubject("");
    setBody("");
    setAccountInfo(null);

    Promise.all([
      supabase.rpc("get_account_recommended_actions", {
        p_account_number: flashcard.account_number,
      }),
      supabase
        .from("accounts")
        .select(
          "account_name, type, region, contact_email, contact_firstname"
        )
        .eq("account_number", flashcard.account_number)
        .single(),
    ]).then(([rpcRes, accountRes]) => {
      const actions = (rpcRes.data as RecommendedAction[] | null) ?? [];
      const filtered: EmailAction[] = actions
        .filter(
          (a) =>
            a.action_type === "email" &&
            a.email_subject &&
            a.email_body
        )
        .map((a) => ({
          product_sku: a.product_sku ?? "",
          product_name: (a.product_name ?? "").trim(),
          email_subject: a.email_subject as string,
          email_body: a.email_body as string,
        }));

      setEmailActions(filtered);
      setAccountInfo((accountRes.data as AccountInfo | null) ?? null);

      if (filtered.length > 0) {
        const firstname =
          (accountRes.data as AccountInfo | null)?.contact_firstname ??
          null;
        setSubject(substitutePrenom(filtered[0].email_subject, firstname));
        setBody(substitutePrenom(filtered[0].email_body, firstname));
      }
      setLoading(false);
    });
  }, [open, flashcard]);

  useEffect(() => {
    if (emailActions.length === 0) return;
    const action = emailActions[selectedIndex];
    if (!action) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSubject(
      substitutePrenom(action.email_subject, accountInfo?.contact_firstname ?? null)
    );
    setBody(
      substitutePrenom(action.email_body, accountInfo?.contact_firstname ?? null)
    );
  }, [selectedIndex, emailActions, accountInfo]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleSelectChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedIndex(Number(e.target.value));
    },
    []
  );

  const handleSend = useCallback(() => {
    const recipient = accountInfo?.contact_email ?? "";
    const mailto = `mailto:${recipient}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  }, [accountInfo, subject, body]);

  if (!open || !flashcard) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Preparer l'email - ${flashcard.account_name}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--white)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          maxWidth: 540,
          width: "100%",
          padding: 22,
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          maxHeight: "85vh",
          overflowY: "auto",
          animation: "fadeIn 0.25s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: "var(--text)",
                letterSpacing: "-0.02em",
              }}
            >
Preparer l&apos;email
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--muted)",
                marginTop: 2,
              }}
            >
              {flashcard.account_name} · {flashcard.account_number}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "var(--muted)",
              fontSize: 16,
              lineHeight: 1,
              padding: 4,
              fontFamily: "Figtree, sans-serif",
            }}
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              color: "var(--muted)",
              fontSize: 13,
            }}
          >
            Preparation en cours…
          </div>
        ) : emailActions.length === 0 ? (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              color: "var(--muted)",
              fontSize: 13,
            }}
          >
            Aucune recommandation par email pour ce compte.
            <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                onClick={onClose}
                style={{
                  padding: "8px 16px",
                  border: "1px solid var(--border)",
                  background: "white",
                  borderRadius: 8,
                  fontSize: 12.5,
                  color: "var(--text)",
                  cursor: "pointer",
                  fontFamily: "Figtree, sans-serif",
                  fontWeight: 600,
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <>
            <div
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 14,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: "6px 14px",
                  fontSize: 12.5,
                }}
              >
                <span style={{ color: "var(--muted)", fontWeight: 600 }}>Compte</span>
                <span style={{ color: "var(--text)" }}>{flashcard.account_name} ({flashcard.account_number})</span>
                {accountInfo?.type && (
                  <>
                    <span style={{ color: "var(--muted)", fontWeight: 600 }}>Type</span>
                    <span style={{ color: "var(--text)" }}>{accountInfo.type}</span>
                  </>
                )}
                {accountInfo?.region && (
                  <>
                    <span style={{ color: "var(--muted)", fontWeight: 600 }}>Region</span>
                    <span style={{ color: "var(--text)" }}>{accountInfo.region}</span>
                  </>
                )}
                <span style={{ color: "var(--muted)", fontWeight: 600 }}>
                  A envoyer a
                </span>
                <span style={{ color: accountInfo?.contact_email ? "var(--active)" : "var(--muted)", fontWeight: accountInfo?.contact_email ? 600 : 400 }}>
                  {accountInfo?.contact_email ?? "—"}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--muted)",
                  marginBottom: 5,
                }}
              >
                Produit a recommander
              </label>
              <select
                value={String(selectedIndex)}
                onChange={handleSelectChange}
                style={{
                  width: "100%",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  background: "var(--white)",
                  padding: "8px 10px",
                  fontSize: 12.5,
                  color: "var(--text)",
                  fontFamily: "Figtree, sans-serif",
                }}
              >
                {emailActions.map((a, i) => (
                  <option key={a.product_sku || `email-${i}`} value={String(i)}>
                    {a.product_name || a.product_sku}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--muted)",
                  marginBottom: 5,
                }}
              >
                Objet
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{
                  width: "100%",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  background: "var(--white)",
                  padding: "8px 10px",
                  fontSize: 12.5,
                  color: "var(--text)",
                  fontFamily: "Figtree, sans-serif",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--muted)",
                  marginBottom: 5,
                }}
              >
                Corps de l&apos;email
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                style={{
                  width: "100%",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  background: "var(--white)",
                  padding: "10px 12px",
                  fontSize: 12.5,
                  color: "var(--text)",
                  fontFamily: "Figtree, sans-serif",
                  lineHeight: 1.55,
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <button
                onClick={onClose}
                style={{
                  padding: "8px 16px",
                  border: "1px solid var(--border)",
                  background: "white",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "var(--text)",
                  cursor: "pointer",
                  fontFamily: "Figtree, sans-serif",
                  fontWeight: 600,
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleSend}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  border: "1px solid var(--active)",
                  background: "var(--active)",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "white",
                  cursor: "pointer",
                  fontFamily: "Figtree, sans-serif",
                  fontWeight: 700,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="3.5" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M2.5 5L8 9L13.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Envoyer l&apos;email
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
