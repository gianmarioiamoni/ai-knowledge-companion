import { createClient } from "@/lib/supabase/client";

// Comprehensive diagnostics for Supabase upload issues
export async function runCompleteDiagnostics(): Promise<void> {
  console.log("🔍 STARTING COMPREHENSIVE SUPABASE DIAGNOSTICS");
  console.log("=".repeat(60));

  // 1. Environment Check
  await checkEnvironment();

  // 2. Supabase Connection Test
  await testSupabaseConnection();

  // 3. Storage Bucket Access Test
  await testStorageBucketAccess();

  // 4. Network Configuration Test
  await testNetworkConfiguration();

  // 5. Browser Capabilities Test
  await testBrowserCapabilities();

  // 6. File Upload Test (minimal)
  await testMinimalFileUpload();

  console.log("=".repeat(60));
  console.log("🏁 DIAGNOSTICS COMPLETED");
}

async function checkEnvironment(): Promise<void> {
  console.log("\n📋 1. ENVIRONMENT CHECK");
  console.log("-".repeat(30));

  console.log("🌐 User Agent:", navigator.userAgent);
  console.log("🖥️ Platform:", navigator.platform);
  console.log(
    "📱 Mobile:",
    /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)
  );
  console.log("🔒 HTTPS:", window.location.protocol === "https:");
  console.log("🌍 Origin:", window.location.origin);

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log("🔑 Supabase URL:", supabaseUrl ? "✅ Set" : "❌ Missing");
  console.log("🔑 Supabase Key:", supabaseKey ? "✅ Set" : "❌ Missing");
}

async function testSupabaseConnection(): Promise<void> {
  console.log("\n📋 2. SUPABASE CONNECTION TEST");
  console.log("-".repeat(30));

  try {
    const supabase = createClient();

    // Test basic connection
    const { data, error } = await supabase
      .from("profiles")
      .select("count")
      .limit(1);

    if (error) {
      console.log("❌ Database connection failed:", error.message);
    } else {
      console.log("✅ Database connection successful");
    }
  } catch (error) {
    console.log("❌ Supabase client error:", error);
  }
}

async function testStorageBucketAccess(): Promise<void> {
  console.log("\n📋 3. STORAGE BUCKET ACCESS TEST");
  console.log("-".repeat(30));

  try {
    const supabase = createClient();

    // Test bucket list
    console.log("🔍 Attempting to list buckets...");
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets();

    if (bucketsError) {
      console.log("❌ Cannot list buckets:", bucketsError.message);
      console.log("❌ Error details:", bucketsError);
      return;
    }

    console.log("🔍 Raw buckets response:", buckets);
    console.log(
      "ℹ️ Buckets from listBuckets():",
      buckets?.map((b) => b.name).join(", ") ||
        "None (this is normal for security)"
    );

    // Try direct access to documents bucket
    console.log("🔍 Testing direct access to documents bucket...");
    try {
      const { data: files, error: directError } = await supabase.storage
        .from("documents")
        .list("", { limit: 1 });

      if (directError) {
        console.log("❌ Direct bucket access failed:", directError.message);
        console.log("❌ Direct error details:", directError);
      } else {
        console.log(
          "✅ Direct bucket access successful! Files:",
          files?.length || 0
        );
        console.log("✅ DOCUMENTS BUCKET IS WORKING! Upload should work.");
      }
    } catch (directException) {
      console.log("❌ Direct bucket access exception:", directException);
    }

    // Test documents bucket specifically (legacy - listBuckets often empty for security)
    const documentsBucket = buckets?.find((b) => b.name === "documents");
    if (documentsBucket) {
      console.log("✅ Documents bucket found in list:", documentsBucket);

      // Test bucket file listing
      const { data: files, error: filesError } = await supabase.storage
        .from("documents")
        .list("", { limit: 1 });

      if (filesError) {
        console.log(
          "❌ Cannot list files in documents bucket:",
          filesError.message
        );
      } else {
        console.log(
          "✅ Documents bucket accessible, files:",
          files?.length || 0
        );
      }
    } else {
      console.log(
        "ℹ️ Documents bucket not in list (normal - listBuckets() has security restrictions)"
      );
    }
  } catch (error) {
    console.log("❌ Storage test error:", error);
  }
}

async function testNetworkConfiguration(): Promise<void> {
  console.log("\n📋 4. NETWORK CONFIGURATION TEST");
  console.log("-".repeat(30));

  // Test basic connectivity
  try {
    const response = await fetch("https://httpbin.org/get", {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    console.log("✅ Basic HTTP GET works:", response.status);
  } catch (error) {
    console.log("❌ Basic HTTP GET failed:", error);
  }

  // Test POST with data
  try {
    const testData = new Blob(["test data"], { type: "text/plain" });
    const response = await fetch("https://httpbin.org/post", {
      method: "POST",
      body: testData,
      signal: AbortSignal.timeout(5000),
    });
    console.log("✅ HTTP POST with blob works:", response.status);
  } catch (error) {
    console.log("❌ HTTP POST with blob failed:", error);
  }

  // Test PUT (like presigned URLs)
  try {
    const testData = new Blob(["test data"], { type: "text/plain" });
    const response = await fetch("https://httpbin.org/put", {
      method: "PUT",
      body: testData,
      headers: { "Content-Type": "text/plain" },
      signal: AbortSignal.timeout(5000),
    });
    console.log("✅ HTTP PUT with blob works:", response.status);
  } catch (error) {
    console.log("❌ HTTP PUT with blob failed:", error);
  }
}

async function testBrowserCapabilities(): Promise<void> {
  console.log("\n📋 5. BROWSER CAPABILITIES TEST");
  console.log("-".repeat(30));

  // Test File API
  console.log(
    "📁 File API:",
    typeof File !== "undefined" ? "✅ Available" : "❌ Missing"
  );
  console.log(
    "📁 FileReader API:",
    typeof FileReader !== "undefined" ? "✅ Available" : "❌ Missing"
  );
  console.log(
    "📁 Blob API:",
    typeof Blob !== "undefined" ? "✅ Available" : "❌ Missing"
  );

  // Test fetch API
  console.log(
    "🌐 Fetch API:",
    typeof fetch !== "undefined" ? "✅ Available" : "❌ Missing"
  );

  // Test AbortController
  console.log(
    "🛑 AbortController:",
    typeof AbortController !== "undefined" ? "✅ Available" : "❌ Missing"
  );

  // Test Promise.race
  console.log(
    "⚡ Promise.race:",
    typeof Promise.race !== "undefined" ? "✅ Available" : "❌ Missing"
  );

  // Test localStorage
  try {
    localStorage.setItem("test", "test");
    localStorage.removeItem("test");
    console.log("💾 localStorage:", "✅ Available");
  } catch (error) {
    console.log("💾 localStorage:", "❌ Not available");
  }
}

async function testMinimalFileUpload(): Promise<void> {
  console.log("\n📋 6. MINIMAL FILE UPLOAD TEST");
  console.log("-".repeat(30));

  try {
    const supabase = createClient();

    // Create a minimal test file (text)
    const testContent = `Test file created at ${new Date().toISOString()}`;
    const testFile = new Blob([testContent], { type: "text/plain" });
    const testPath = `test/diagnostic-${Date.now()}.txt`;

    console.log("📄 Created test file:", testFile.size, "bytes");

    // Create a larger binary-like test file (similar to Word doc)
    const binaryContent = new Uint8Array(15000); // 15KB like the failing file
    for (let i = 0; i < binaryContent.length; i++) {
      binaryContent[i] = Math.floor(Math.random() * 256);
    }
    const binaryTestFile = new Blob([binaryContent], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    const binaryTestPath = `test/diagnostic-binary-${Date.now()}.docx`;

    console.log("📄 Created binary test file:", binaryTestFile.size, "bytes");

    // Test 1: Direct upload
    console.log("🧪 Testing direct upload...");
    try {
      const { data: directData, error: directError } = await supabase.storage
        .from("documents")
        .upload(testPath, testFile, { upsert: false });

      if (directError) {
        console.log("❌ Direct upload failed:", directError.message);
      } else {
        console.log("✅ Direct upload successful:", directData.path);

        // Clean up
        await supabase.storage.from("documents").remove([directData.path]);
        console.log("🧹 Test file cleaned up");
      }
    } catch (error) {
      console.log("❌ Direct upload exception:", error);
    }

    // Test 2: Presigned URL upload
    console.log("🧪 Testing presigned URL upload...");
    try {
      const { data: presignedData, error: presignedError } =
        await supabase.storage
          .from("documents")
          .createSignedUploadUrl(`${testPath}-presigned`);

      if (presignedError) {
        console.log(
          "❌ Presigned URL creation failed:",
          presignedError.message
        );
      } else {
        console.log("✅ Presigned URL created");

        // Try upload to presigned URL
        const uploadResponse = await fetch(presignedData.signedUrl, {
          method: "PUT",
          body: testFile,
          headers: { "Content-Type": "text/plain" },
          signal: AbortSignal.timeout(10000),
        });

        if (uploadResponse.ok) {
          console.log(
            "✅ Presigned URL upload successful:",
            uploadResponse.status
          );

          // Clean up
          await supabase.storage
            .from("documents")
            .remove([`${testPath}-presigned`]);
          console.log("🧹 Presigned test file cleaned up");
        } else {
          console.log(
            "❌ Presigned URL upload failed:",
            uploadResponse.status,
            uploadResponse.statusText
          );
        }
      }
    } catch (error) {
      console.log("❌ Presigned URL upload exception:", error);
    }

    // Test 3: Binary file upload (like Word doc)
    console.log("🧪 Testing binary file upload (Word doc simulation)...");
    try {
      const { data: binaryDirectData, error: binaryDirectError } =
        await supabase.storage
          .from("documents")
          .upload(binaryTestPath, binaryTestFile, { upsert: false });

      if (binaryDirectError) {
        console.log(
          "❌ Binary direct upload failed:",
          binaryDirectError.message
        );
      } else {
        console.log(
          "✅ Binary direct upload successful:",
          binaryDirectData.path
        );

        // Clean up
        await supabase.storage
          .from("documents")
          .remove([binaryDirectData.path]);
        console.log("🧹 Binary test file cleaned up");
      }
    } catch (error) {
      console.log("❌ Binary upload exception:", error);
    }

    // Test 4: Binary presigned URL upload
    console.log("🧪 Testing binary presigned URL upload...");
    try {
      const { data: binaryPresignedData, error: binaryPresignedError } =
        await supabase.storage
          .from("documents")
          .createSignedUploadUrl(`${binaryTestPath}-presigned`);

      if (binaryPresignedError) {
        console.log(
          "❌ Binary presigned URL creation failed:",
          binaryPresignedError.message
        );
      } else {
        console.log("✅ Binary presigned URL created");

        // Try upload to presigned URL
        const binaryUploadResponse = await fetch(
          binaryPresignedData.signedUrl,
          {
            method: "PUT",
            body: binaryTestFile,
            headers: {
              "Content-Type":
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            },
            signal: AbortSignal.timeout(15000), // Longer timeout for binary
          }
        );

        if (binaryUploadResponse.ok) {
          console.log(
            "✅ Binary presigned URL upload successful:",
            binaryUploadResponse.status
          );

          // Clean up
          await supabase.storage
            .from("documents")
            .remove([`${binaryTestPath}-presigned`]);
          console.log("🧹 Binary presigned test file cleaned up");
        } else {
          console.log(
            "❌ Binary presigned URL upload failed:",
            binaryUploadResponse.status,
            binaryUploadResponse.statusText
          );
        }
      }
    } catch (error) {
      console.log("❌ Binary presigned URL upload exception:", error);
    }

    // Test 5: Real file upload test (if available)
    console.log("🧪 Testing real file upload (if file input available)...");
    try {
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        const realFile = fileInput.files[0];
        console.log("📄 Found real file:", {
          name: realFile.name,
          size: realFile.size,
          type: realFile.type,
          lastModified: realFile.lastModified,
        });

        // Test real file direct upload
        const realTestPath = `test/real-diagnostic-${Date.now()}.${realFile.name
          .split(".")
          .pop()}`;
        const { data: realDirectData, error: realDirectError } =
          await supabase.storage
            .from("documents")
            .upload(realTestPath, realFile, { upsert: false });

        if (realDirectError) {
          console.log(
            "❌ Real file direct upload failed:",
            realDirectError.message
          );
        } else {
          console.log(
            "✅ Real file direct upload successful:",
            realDirectData.path
          );

          // Clean up
          await supabase.storage
            .from("documents")
            .remove([realDirectData.path]);
          console.log("🧹 Real file test cleaned up");
        }

        // Test real file presigned URL
        const { data: realPresignedData, error: realPresignedError } =
          await supabase.storage
            .from("documents")
            .createSignedUploadUrl(`${realTestPath}-presigned`);

        if (realPresignedError) {
          console.log(
            "❌ Real file presigned URL creation failed:",
            realPresignedError.message
          );
        } else {
          console.log("✅ Real file presigned URL created");

          const realUploadResponse = await fetch(realPresignedData.signedUrl, {
            method: "PUT",
            body: realFile,
            headers: { "Content-Type": realFile.type },
            signal: AbortSignal.timeout(30000), // Longer timeout
          });

          if (realUploadResponse.ok) {
            console.log(
              "✅ Real file presigned URL upload successful:",
              realUploadResponse.status
            );

            // Clean up
            await supabase.storage
              .from("documents")
              .remove([`${realTestPath}-presigned`]);
            console.log("🧹 Real file presigned test cleaned up");
          } else {
            console.log(
              "❌ Real file presigned URL upload failed:",
              realUploadResponse.status,
              realUploadResponse.statusText
            );
          }
        }
      } else {
        console.log(
          "ℹ️ No real file available for testing (select a file first)"
        );
      }
    } catch (error) {
      console.log("❌ Real file test exception:", error);
    }

    // Test 6: Simulate exact app flow
    console.log("🧪 Testing exact app flow simulation...");
    try {
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        const realFile = fileInput.files[0];
        console.log("📄 Simulating app upload flow for:", realFile.name);

        // Import the exact same function the app uses
        const { uploadFile } = await import("@/lib/supabase/documents");
        const { createClient } = await import("@/lib/supabase/client");

        // Get user ID exactly like the app does
        const supabaseClient = createClient();
        const {
          data: { user },
        } = await supabaseClient.auth.getUser();

        if (!user) {
          console.log("❌ No authenticated user found");
          return;
        }

        console.log("🔍 App flow simulation:", {
          userId: user.id,
          fileName: realFile.name,
          fileSize: realFile.size,
        });

        // Call the exact same function with exact same parameters
        const appResult = await uploadFile(realFile, user.id);

        if (appResult.error) {
          console.log("❌ App flow simulation failed:", appResult.error);
        } else {
          console.log("✅ App flow simulation successful:", appResult.path);

          // Clean up
          await supabaseClient.storage
            .from("documents")
            .remove([appResult.path]);
          console.log("🧹 App flow test cleaned up");
        }
      } else {
        console.log("ℹ️ No file selected for app flow simulation");
      }
    } catch (error) {
      console.log("❌ App flow simulation exception:", error);
    }
  } catch (error) {
    console.log("❌ Minimal upload test error:", error);
  }
}

// Additional macOS specific checks
export async function checkMacOSSpecificIssues(): Promise<void> {
  console.log("\n🍎 MACOS SPECIFIC CHECKS");
  console.log("-".repeat(30));

  // Check for Little Snitch or similar network monitors
  console.log("🔍 Checking for potential network interference...");

  // Test with different user agents
  const originalUserAgent = navigator.userAgent;
  console.log("🔍 Original User Agent:", originalUserAgent);

  // Check for proxy settings (can't directly access but can infer)
  try {
    const start = performance.now();
    await fetch("https://httpbin.org/ip", {
      signal: AbortSignal.timeout(3000),
    });
    const end = performance.now();
    const latency = end - start;
    console.log("🌐 Network latency:", Math.round(latency), "ms");

    if (latency > 2000) {
      console.log("⚠️ High latency detected - possible proxy/VPN");
    }
  } catch (error) {
    console.log("❌ Network latency test failed:", error);
  }

  // Check for Content Security Policy issues
  const metaTags = document.querySelectorAll(
    'meta[http-equiv="Content-Security-Policy"]'
  );
  if (metaTags.length > 0) {
    console.log("🔒 CSP detected:", metaTags.length, "policies");
  } else {
    console.log("🔒 No CSP meta tags found");
  }
}
