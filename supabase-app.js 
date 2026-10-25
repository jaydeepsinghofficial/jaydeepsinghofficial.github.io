(() => {
  "use strict";

  const start = () => {
    if (!window.supabase || !window.SUPABASE_URL ||
        !window.SUPABASE_PUBLISHABLE_KEY) {
      console.error("Supabase config or SDK missing.");
      return;
    }

    const db = window.supabase.createClient(
      window.SUPABASE_URL,
      window.SUPABASE_PUBLISHABLE_KEY
    );

    const $ = (tag, attrs = {}, text = "") => {
      const el = document.createElement(tag);
      Object.entries(attrs).forEach(([key, value]) => {
        if (key === "className") el.className = value;
        else if (key === "style") el.style.cssText = value;
        else el.setAttribute(key, value);
      });
      if (text) el.textContent = text;
      return el;
    };

    const style = $("style");
    style.textContent = `
      #js-auth-entry{position:fixed;right:14px;top:14px;z-index:9998}
      #js-auth-entry button,#js-auth-modal button,#js-admin-panel button{
        padding:11px 15px;border:1px solid #c5a56a;border-radius:10px;
        background:#202020;color:white;font-size:14px;cursor:pointer;margin:4px
      }
      #js-auth-modal{position:fixed;inset:0;z-index:99999;background:#0009;
        display:none;align-items:center;justify-content:center;padding:16px}
      #js-auth-card{width:min(420px,100%);max-height:90vh;overflow:auto;
        background:#fff;color:#202020;padding:22px;border-radius:18px;
        box-sizing:border-box;font-family:Arial,sans-serif}
      #js-auth-card input,#js-admin-panel input,#js-admin-panel textarea,
      #js-admin-panel select{display:block;width:100%;box-sizing:border-box;
        padding:12px;margin:9px 0;border:1px solid #ddd;border-radius:8px;
        background:white;color:#222}
      #js-auth-card button.secondary,#js-admin-panel button.secondary{
        background:#fff;color:#222;border-color:#ddd}
      #js-auth-message{font-size:14px;white-space:pre-wrap;overflow-wrap:anywhere}
      #js-admin-panel{position:relative;z-index:20;background:#fff;color:#222;
        padding:18px;border:1px solid #ddd;border-radius:14px;margin:18px 0;
        font:14px Arial,sans-serif}
      #js-admin-panel .js-content-item{padding:12px;border-bottom:1px solid #ddd}
      #js-admin-panel label{display:block;margin-top:10px}
    `;
    document.head.appendChild(style);

    const entry = $("div", { id: "js-auth-entry" });
    const openBtn = $("button", {}, "Login");
    entry.appendChild(openBtn);
    document.body.appendChild(entry);

    const modal = $("div", { id: "js-auth-modal" });
    const card = $("div", { id: "js-auth-card" });
    const heading = $("h2", {}, "Welcome");
    const intro = $("p", {}, "Sign in or create your Jaydeep Singh App account.");
    const email = $("input", {
      type: "email", placeholder: "Email address", autocomplete: "email"
    });
    const password = $("input", {
      type: "password", placeholder: "Password (minimum 6 characters)",
      autocomplete: "current-password"
    });
    const message = $("p", { id: "js-auth-message", role: "status" });
    const loginBtn = $("button", {}, "Login");
    const signupBtn = $("button", {}, "Create account");
    const googleBtn = $("button", {}, "Continue with Google");
    const closeBtn = $("button", { className: "secondary" }, "Close");
    const signoutBtn = $("button", { className: "secondary" }, "Sign out");
    const adminBtn = $("button", { style: "display:none" }, "Open Admin Panel");

    card.append(
      heading, intro, email, password, loginBtn, signupBtn,
      googleBtn, signoutBtn, adminBtn, closeBtn, message
    );
    modal.appendChild(card);
    document.body.appendChild(modal);

    const adminPanel = $("section", { id: "js-admin-panel" });
    adminPanel.hidden = true;
    const adminHeading = $("h2", {}, "Admin Dashboard");
    const adminNote = $("p", {}, "Create and publish learning content.");
    const form = $("form");
    const title = $("input", { placeholder: "Content title", required: "required" });
    const description = $("textarea", { placeholder: "Description" });
    const type = $("select");
    [
      ["video", "Video"], ["pdf", "PDF Notes"], ["book", "Book"],
      ["announcement", "Announcement"], ["design", "Design"],
      ["project", "Project"], ["quiz", "Quiz"]
    ].forEach(([value, label]) => type.appendChild($("option", { value }, label)));

    const url = $("input", {
      type: "url", placeholder: "External video/link URL (optional)"
    });
    const file = $("input", { type: "file", accept: ".pdf,.jpg,.jpeg,.png,.webp,.mp4" });
    const access = $("select");
    access.append(
      $("option", { value: "free" }, "Free"),
      $("option", { value: "paid" }, "Paid")
    );
    const price = $("input", {
      type: "number", min: "0", step: "1", placeholder: "Price in INR (paid content)"
    });
    const publishedLabel = $("label");
    const published = $("input", { type: "checkbox" });
    published.checked = true;
    publishedLabel.append(published, document.createTextNode(" Publish immediately"));
    const saveBtn = $("button", { type: "submit" }, "Save content");
    const refreshBtn = $("button", { type: "button", className: "secondary" }, "Refresh list");
    const closeAdminBtn = $("button", { type: "button", className: "secondary" }, "Close admin");
    const adminMessage = $("p", { role: "status" });
    const contentList = $("div");
    form.append(
      title, description, type, url, file, access, price, publishedLabel, saveBtn
    );
    adminPanel.append(
      adminHeading, adminNote, form, refreshBtn, closeAdminBtn, adminMessage, contentList
    );
    document.body.appendChild(adminPanel);

    let currentUser = null;
    let currentRole = "student";

    const say = (text) => { message.textContent = text; };
    const adminSay = (text) => { adminMessage.textContent = text; };

    openBtn.addEventListener("click", () => {
      modal.style.display = "flex";
      say(currentUser ? `Signed in as ${currentUser.email}` : "");
    });
    closeBtn.addEventListener("click", () => { modal.style.display = "none"; });
    modal.addEventListener("click", (event) => {
      if (event.target === modal) modal.style.display = "none";
    });

    loginBtn.addEventListener("click", async () => {
      if (!email.value.trim() || !password.value) {
        say("Enter your email and password.");
        return;
      }
      say("Signing in…");
      const { error } = await db.auth.signInWithPassword({
        email: email.value.trim(), password: password.value
      });
      say(error ? error.message : "Login successful.");
    });

    signupBtn.addEventListener("click", async () => {
      if (!email.value.trim() || password.value.length < 6) {
        say("Enter a valid email and a password of at least 6 characters.");
        return;
      }
      say("Creating account…");
      const { data, error } = await db.auth.signUp({
        email: email.value.trim(),
        password: password.value,
        options: { emailRedirectTo: window.location.origin + window.location.pathname }
      });
      if (error) say(error.message);
      else if (!data.session) say("Account created. Check your email to confirm it, then log in.");
      else say("Account created and signed in.");
    });

    googleBtn.addEventListener("click", async () => {
      say("Opening Google sign-in…");
      const { error } = await db.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + window.location.pathname }
      });
      if (error) say(error.message);
    });

    signoutBtn.addEventListener("click", async () => {
      const { error } = await db.auth.signOut();
      say(error ? error.message : "Signed out.");
    });

    adminBtn.addEventListener("click", async () => {
      modal.style.display = "none";
      adminPanel.hidden = false;
      await loadContent();
      adminPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    closeAdminBtn.addEventListener("click", () => { adminPanel.hidden = true; });

    async function refreshSession(session) {
      currentUser = session?.user || null;
      currentRole = "student";
      adminPanel.hidden = true;

      if (!currentUser) {
        openBtn.textContent = "Login";
        signoutBtn.style.display = "none";
        adminBtn.style.display = "none";
        return;
      }

      openBtn.textContent = "My Account";
      signoutBtn.style.display = "inline-block";
      email.value = currentUser.email || "";

      const { data, error } = await db
        .from("profiles")
        .select("display_name, role")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (error) {
        say("Signed in. Profile status could not be loaded: " + error.message);
        return;
      }

      currentRole = data?.role || "student";
      heading.textContent = data?.display_name || "My Account";
      adminBtn.style.display = currentRole === "admin" ? "inline-block" : "none";
      say(`Signed in as ${currentUser.email}\nRole: ${currentRole}`);
    }

    async function loadContent() {
      contentList.replaceChildren();
      adminSay("Loading content…");

      const { data, error } = await db
        .from("content_items")
        .select("id,title,type,description,external_url,access_type,price_inr,is_published")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        adminSay("Could not load content: " + error.message);
        return;
      }

      adminSay(`${data.length} item(s) found.`);
      data.forEach((item) => {
        const row = $("div", { className: "js-content-item" });
        const name = $("strong", {}, item.title || "Untitled");
        const info = $("p", {}, `${item.type || "content"} · ${item.access_type || "free"} · ${item.is_published ? "Published" : "Draft"}`);
        const toggle = $("button", {}, item.is_published ? "Unpublish" : "Publish");
        toggle.addEventListener("click", async () => {
          const { error: updateError } = await db
            .from("content_items")
            .update({ is_published: !item.is_published })
            .eq("id", item.id);
          if (updateError) adminSay("Update failed: " + updateError.message);
          else await loadContent();
        });
        row.append(name, info, toggle);
        if (item.description) row.appendChild($("p", {}, item.description));
        contentList.appendChild(row);
      });
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!currentUser || currentRole !== "admin") {
        adminSay("Admin access required.");
        return;
      }

      saveBtn.disabled = true;
      adminSay("Saving content…");

      try {
        const payload = {
          title: title.value.trim(),
          description: description.value.trim() || null,
          type: type.value,
          external_url: url.value.trim() || null,
          access_type: access.value,
          price_inr: access.value === "paid" ? Number(price.value || 0) : 0,
          is_published: published.checked,
          created_by: currentUser.id
        };

        if (!payload.title) throw new Error("Enter a title.");
        if (payload.access_type === "paid" && payload.price_inr <= 0) {
          throw new Error("Enter a price greater than zero for paid content.");
        }

        const { data, error } = await db
          .from("content_items")
          .insert(payload)
          .select("id")
          .single();

        if (error) throw error;

        if (file.files && file.files[0]) {
          const selected = file.files[0];
          const safeName = selected.name.replace(/[^a-zA-Z0-9._-]/g, "_");
          const path = `${data.id}/${Date.now()}-${safeName}`;

          const { error: uploadError } = await db.storage
            .from("creator-uploads")
            .upload(path, selected, { upsert: false });

          if (uploadError) {
            adminSay("Content row saved, but file upload failed: " + uploadError.message);
            return;
          }

          const { error: fileUpdateError } = await db
            .from("content_items")
            .update({ file_url: path })
            .eq("id", data.id);

          if (fileUpdateError) {
            adminSay("File uploaded, but file reference update failed: " + fileUpdateError.message);
            return;
          }
        }

        form.reset();
        published.checked = true;
        adminSay("Content saved successfully.");
        await loadContent();
      } catch (error) {
        adminSay("Could not save: " + (error.message || "Unknown error"));
      } finally {
        saveBtn.disabled = false;
      }
    });

    refreshBtn.addEventListener("click", loadContent);

    db.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => refreshSession(session), 0);
    });

    db.auth.getSession().then(({ data, error }) => {
      if (error) say(error.message);
      refreshSession(data?.session || null);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
