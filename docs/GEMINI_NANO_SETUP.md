# Gemini Nano & Chrome Built-In AI Hardware Setup — UMBRAL Hybrid AI

UMBRAL integrates Chrome Built-in AI (`window.LanguageModel`) through Firebase AI Logic Hybrid (`firebase/ai`, `InferenceMode.PREFER_ON_DEVICE` and `InferenceMode.ONLY_ON_DEVICE`). Because on-device model weights (~1.5–2+ GB) depend on Chrome desktop channel, flags, disk free space, and GPU/NPU hardware eligibility, follow this guide on your physical desktop before recording or verifying `ON_DEVICE` runs.

---

## 1. Hardware & Browser Requirements

- **OS:** Windows 10/11, macOS 13+, or Linux desktop (x64/arm64). Mobile browsers do not expose Chrome Desktop Prompt API local Nano weights.
- **Browser:** Google Chrome Desktop `>= 139` (tested on real desktop Chrome `157.0.8103.51`, which ships `gemma4_component` `2026.8.7.929`).
- **Disk (`User Data` + OS `%TEMP%`):** **`>= 25 GB` free disk space on BOTH the Chrome User Data drive AND OS `%TEMP%` / `%TMP%` volume**. Chromium enforces `Enough disk space to install: 20480 MiB required` (`20 GiB`) and stages a `~4.2 GB` archive in `%TEMP%` before unpacking `weights.bin` (`2,360.73 MiB`). If `%TEMP%` sits on a low-space system drive (`C:`), download fails even when `--user-data-dir` points to another drive.
- **GPU / VRAM:** Dedicated GPU passing Chrome's **`>= 3000 MiB` detected free VRAM** check (`> 4 GB` VRAM recommended, e.g., **RTX 3060 6GB/12GB, RTX 4060 8GB**, or **Apple Silicon M1/M2/M3/M4 `>= 16 GB`**). On our `RTX 3050 4 GB Laptop GPU` test machine, `chrome://on-device-internals` reported `Enough VRAM: false (0 MiB actual, 3000 MiB required)` and `Performance Class: ServiceCrash`, causing `LanguageModel.create()` to hit Chrome's `3/3` crash limit (`NotSupportedError`).
- **Network:** Internet connection is needed **only once** while downloading the Optimization Guide On-Device Model weights; subsequent `ONLY_ON_DEVICE` / ready `PREFER_ON_DEVICE` runs execute offline with zero outbound packets.

---

## 2. Chrome Flags & Component Update Steps

1. In Chrome Desktop `157+`, check `chrome://flags` for:
   - `#prompt-api` (**Enabled**)
   - `#prompt-api-multimodal-input` (**Enabled**, optional if testing text-only)
   - `#gemma4-for-built-in-ai` (**Enabled**, default on Chrome 157+ where exposed)
   - `#optimization-guide-on-device-model` (**Enabled** on certified GPUs, or **Enabled BypassPerfRequirement** when evaluating hardware overrides; on Chrome 139–14x builds, check `#prompt-api-for-gemini-nano`).
2. Click **Relaunch** so Chrome restarts cleanly.
3. Visit `chrome://on-device-internals` to inspect hardware readiness (`Enough VRAM: true`, non-error `Device performance class`), `Broker State`, and current model state.
4. Visit `chrome://components`, find **Optimization Guide On Device Model** (`gemma4_component`), and click **Check for update** if needed.

---

## 3. Verifying Inside UMBRAL (`/settings` & Opportunity Detail)

1. Ensure `.env.local` is configured (see [FIREBASE_SETUP.md](FIREBASE_SETUP.md)) because `firebase/ai` wraps the hybrid `GenerativeModel` client before calling `initializeDeviceModel()`.
   - Even without `.env.local`, UMBRAL's independent browser probe checks `window.LanguageModel.availability()` and renders honest capability diagnostics in `/settings`.
2. Open `/settings` in that Chrome Desktop profile and check **Live Environment & Model Readiness**:
   - **Chrome Prompt API (window.LanguageModel):** **`Supported`**
   - **Local Gemini Nano status:** **`Downloadable on user action`**, **`Downloading now…`**, or **`Ready on-device`** (if it reads **`Unavailable on current device/disk`**, re-check disk free space and `chrome://on-device-internals`).
3. If status shows **`Downloadable on user action`**, click **Download / initialize local model** in `/settings` or on any Opportunity Detail page:
   - Calls `initializeDeviceModel({ onProgress })` inside [hybridAiAdapter.ts](../src/adapters/firebase/hybridAiAdapter.ts). Progress updates (`Downloading local Gemini Nano… XX%`) and any error render in a non-blocking alert banner (`downloadError`).
4. Once status reaches **`Ready on-device`** (`available`), select **Prefer On-Device (Hybrid Default)** or **Strict On-Device Only** (`ONLY_ON_DEVICE`).
5. Open Chrome DevTools -> **Network** -> toggle **Offline** (or disconnect Wi-Fi) and click **Explain requirements** on any opportunity:
   - The provenance badge displays **`Ran on-device · Chrome Gemini Nano`** read directly from `result.response.inferenceSource === 'ON_DEVICE'`, confirming zero cloud network payload.

---

## 4. Standalone Gemini Nano Verification Procedure (Offline & Privacy Proof)

Run this isolated validation sequence on **Chrome Desktop `>= 139`** to verify pure on-device behavior before recording or merging:

1. **Check Chrome hardware & component state:** Confirm `chrome://on-device-internals` shows ready status and `chrome://components` -> **Optimization Guide On Device Model** shows a real version (not `0.0.0.0`).
2. **Download / initialization trigger:** Open `/settings` in UMBRAL -> confirm `Chrome Prompt API` = `Supported`. If status is `Downloadable on user action`, click **Download / initialize local model** and wait for `100%` -> `Ready on-device` (`available`). (If disk/GPU check rejects download, inspect the visible `downloadError` alert banner cleanly.)
3. **Zero-cloud baseline check:** Toggle **Cloud Consent** **OFF** in `/settings` and set inference preference to **Prefer On-Device (Hybrid Default)**.
4. **Go physically Offline (or Chrome DevTools Network -> Offline):** Open `/opportunities/int-eth-esop-2027` -> run both **Explain requirements** and **Propose 3 prep steps** while offline -> verify **`Ran on-device · Chrome Gemini Nano`** (`inferenceSource: ON_DEVICE`) completes cleanly with **0 bytes** outbound traffic in Network.
5. **Strict On-Device boundary check (`ONLY_ON_DEVICE`):** Switch mode to **Strict On-Device Only**, verify structured guidance completes offline, and verify the **Cloud Multi-Turn Follow-Up** section clearly disables submission and shows the offline/cloud-only explanation rather than misrepresenting local availability.
6. **Confirm State E in Diagnostics:** Visit `/settings` -> confirm **Operational verification status** updates to **`State E · Gemini Nano available & ON_DEVICE inference confirmed in session`** and **Session AI Execution Log** shows `... → ON_DEVICE`.
