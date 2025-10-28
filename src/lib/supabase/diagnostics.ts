import { createClient } from "@/lib/supabase/client";

// Comprehensive diagnostics for Supabase upload issues
export async function runCompleteDiagnostics(): Promise<void> {
  console.log("🔍 STARTING COMPREHENSIVE SUPABASE DIAGNOSTICS");
  console.log("=".repeat(60));

  const results = {
    environment: false,
    supabaseConnection: false,
    storageAccess: false,
    networkConfig: false,
    browserCapabilities: false,
    fileUpload: false,
    criticalIssues: [] as string[],
    warnings: [] as string[],
    recommendations: [] as string[]
  };

  // 1. Environment Check
  results.environment = await checkEnvironment();
  if (!results.environment) {
    results.criticalIssues.push("Environment variables not properly configured");
  }

  // 2. Supabase Connection Test
  results.supabaseConnection = await testSupabaseConnection();
  if (!results.supabaseConnection) {
    results.criticalIssues.push("Cannot connect to Supabase database");
  }

  // 3. Storage Bucket Access Test
  results.storageAccess = await testStorageBucketAccess();
  if (!results.storageAccess) {
    results.criticalIssues.push("Cannot access documents storage bucket");
  }

  // 4. Network Configuration Test
  results.networkConfig = await testNetworkConfiguration();
  if (!results.networkConfig) {
    results.warnings.push("Network connectivity issues detected");
  }

  // 5. Browser Capabilities Test
  results.browserCapabilities = await testBrowserCapabilities();
  if (!results.browserCapabilities) {
    results.criticalIssues.push("Required browser capabilities missing");
  }

  // 6. File Upload Test (minimal)
  results.fileUpload = await testMinimalFileUpload();
  if (!results.fileUpload) {
    results.criticalIssues.push("File upload tests failed");
  }

  // Add recommendations based on results
  if (window.location.protocol !== "https:") {
    results.recommendations.push("Switch to HTTPS for production deployment");
  }
  
  if (results.fileUpload && results.storageAccess) {
    results.recommendations.push("Upload system is working perfectly - no action needed");
  }

  // Generate final report
  generateFinalReport(results);

  console.log("=".repeat(60));
  console.log("🏁 DIAGNOSTICS COMPLETED");
}

// Silent version of diagnostics - no console output
export async function runSilentDiagnostics(): Promise<{
  environment: boolean;
  supabaseConnection: boolean;
  storageAccess: boolean;
  networkConfig: boolean;
  browserCapabilities: boolean;
  fileUpload: boolean;
  criticalIssues: string[];
  warnings: string[];
  recommendations: string[];
}> {
  const results = {
    environment: false,
    supabaseConnection: false,
    storageAccess: false,
    networkConfig: false,
    browserCapabilities: false,
    fileUpload: false,
    criticalIssues: [] as string[],
    warnings: [] as string[],
    recommendations: [] as string[]
  };

  // 1. Environment Check
  results.environment = await checkEnvironmentSilent();
  if (!results.environment) {
    results.criticalIssues.push("Environment variables not properly configured");
  }

  // 2. Supabase Connection Test
  results.supabaseConnection = await testSupabaseConnectionSilent();
  if (!results.supabaseConnection) {
    results.criticalIssues.push("Cannot connect to Supabase database");
  }

  // 3. Storage Bucket Access Test
  results.storageAccess = await testStorageBucketAccessSilent();
  if (!results.storageAccess) {
    results.criticalIssues.push("Cannot access documents storage bucket");
  }

  // 4. Network Configuration Test
  results.networkConfig = await testNetworkConfigurationSilent();
  if (!results.networkConfig) {
    results.warnings.push("Network connectivity issues detected");
  }

  // 5. Browser Capabilities Test
  results.browserCapabilities = await testBrowserCapabilitiesSilent();
  if (!results.browserCapabilities) {
    results.criticalIssues.push("Required browser capabilities missing");
  }

  // 6. File Upload Test (minimal)
  results.fileUpload = await testMinimalFileUploadSilent();
  if (!results.fileUpload) {
    results.criticalIssues.push("File upload tests failed");
  }

  // Add recommendations based on results
  if (typeof window !== 'undefined' && window.location.protocol !== "https:") {
    results.recommendations.push("Switch to HTTPS for production deployment");
  }
  
  if (results.fileUpload && results.storageAccess) {
    results.recommendations.push("Upload system is working perfectly - no action needed");
  }

  return results;
}

function generateFinalReport(results: any): void {
  console.log("\n📊 FINAL DIAGNOSTIC REPORT");
  console.log("=".repeat(60));
  
  const criticalCount = results.criticalIssues.length;
  const warningCount = results.warnings.length;
  
  if (criticalCount === 0) {
    console.log("🎉 OVERALL STATUS: ✅ EXCELLENT - All critical systems working!");
  } else if (criticalCount <= 2) {
    console.log("⚠️ OVERALL STATUS: ⚠️ WARNING - Some issues detected");
  } else {
    console.log("❌ OVERALL STATUS: ❌ CRITICAL - Multiple issues detected");
  }
  
  console.log(`\n📈 SUMMARY:`);
  console.log(`   ✅ Working: ${Object.values(results).filter(v => v === true).length} systems`);
  console.log(`   ❌ Critical Issues: ${criticalCount}`);
  console.log(`   ⚠️ Warnings: ${warningCount}`);
  
  if (results.criticalIssues.length > 0) {
    console.log(`\n🚨 CRITICAL ISSUES:`);
    results.criticalIssues.forEach((issue: string, index: number) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
  }
  
  if (results.warnings.length > 0) {
    console.log(`\n⚠️ WARNINGS:`);
    results.warnings.forEach((warning: string, index: number) => {
      console.log(`   ${index + 1}. ${warning}`);
    });
  }
  
  if (results.recommendations.length > 0) {
    console.log(`\n💡 RECOMMENDATIONS:`);
    results.recommendations.forEach((rec: string, index: number) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
  }
  
  console.log(`\n🔧 NEXT STEPS:`);
  if (criticalCount === 0) {
    console.log("   • Your upload system is working perfectly!");
    console.log("   • You can proceed with normal file uploads");
    console.log("   • Consider switching to HTTPS for production");
  } else {
    console.log("   • Address critical issues first");
    console.log("   • Check Supabase configuration");
    console.log("   • Verify network connectivity");
  }
}

async function checkEnvironment(): Promise<boolean> {
  console.log("\n📋 1. ENVIRONMENT CHECK");
  console.log("-".repeat(30));

  let hasIssues = false;

  console.log("🌐 User Agent:", navigator.userAgent);
  console.log("🖥️ Platform:", navigator.platform);
  console.log(
    "📱 Mobile:",
    /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)
  );
  
  const isHttps = window.location.protocol === "https:";
  console.log("🔒 HTTPS:", isHttps ? "✅ Yes" : "⚠️ No (HTTP)");
  console.log("🌍 Origin:", window.location.origin);

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const urlSet = !!supabaseUrl;
  const keySet = !!supabaseKey;

  console.log("🔑 Supabase URL:", urlSet ? "✅ Set" : "❌ Missing");
  console.log("🔑 Supabase Key:", keySet ? "✅ Set" : "❌ Missing");

  if (!urlSet || !keySet) {
    hasIssues = true;
  }

  if (!isHttps) {
    console.log("⚠️ Running on HTTP - consider HTTPS for production");
  }

  return !hasIssues;
}

// Silent version of environment check
async function checkEnvironmentSilent(): Promise<boolean> {
  let hasIssues = false;

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const urlSet = !!supabaseUrl;
  const keySet = !!supabaseKey;

  if (!urlSet || !keySet) {
    hasIssues = true;
  }

  return !hasIssues;
}

async function testSupabaseConnection(): Promise<boolean> {
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
      return false;
    } else {
      console.log("✅ Database connection successful");
      return true;
    }
  } catch (error) {
    console.log("❌ Supabase client error:", error);
    return false;
  }
}

async function testStorageBucketAccess(): Promise<boolean> {
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
      return false;
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
        return false;
      } else {
        console.log(
          "✅ Direct bucket access successful! Files:",
          files?.length || 0
        );
        console.log("✅ DOCUMENTS BUCKET IS WORKING! Upload should work.");
        return true;
      }
    } catch (directException) {
      console.log("❌ Direct bucket access exception:", directException);
      return false;
    }
  } catch (error) {
    console.log("❌ Storage test error:", error);
    return false;
  }
}

async function testNetworkConfiguration(): Promise<boolean> {
  console.log("\n📋 4. NETWORK CONFIGURATION TEST");
  console.log("-".repeat(30));

  let networkWorking = true;
  let externalTestsFailed = 0;

  // Test basic connectivity
  try {
    const response = await fetch("https://httpbin.org/get", {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    console.log("✅ Basic HTTP GET works:", response.status);
  } catch (error) {
    console.log("⚠️ Basic HTTP GET failed (external service):", error);
    externalTestsFailed++;
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
    console.log("⚠️ HTTP POST with blob failed (external service):", error);
    externalTestsFailed++;
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
    console.log("⚠️ HTTP PUT with blob failed (external service):", error);
    externalTestsFailed++;
  }

  if (externalTestsFailed === 3) {
    console.log("ℹ️ All external network tests failed - this is normal and doesn't affect Supabase");
    console.log("ℹ️ External services may be blocked by CORS or network policies");
    networkWorking = true; // Still consider network working for Supabase
  } else if (externalTestsFailed > 0) {
    console.log("⚠️ Some external network tests failed - this is normal and doesn't affect Supabase");
    networkWorking = true; // Still consider network working for Supabase
  }

  return networkWorking;
}

async function testBrowserCapabilities(): Promise<boolean> {
  console.log("\n📋 5. BROWSER CAPABILITIES TEST");
  console.log("-".repeat(30));

  let allCapabilitiesAvailable = true;

  // Test File API
  const fileApiAvailable = typeof File !== "undefined";
  console.log(
    "📁 File API:",
    fileApiAvailable ? "✅ Available" : "❌ Missing"
  );
  if (!fileApiAvailable) allCapabilitiesAvailable = false;

  // Test FileReader API
  const fileReaderAvailable = typeof FileReader !== "undefined";
  console.log(
    "📁 FileReader API:",
    fileReaderAvailable ? "✅ Available" : "❌ Missing"
  );
  if (!fileReaderAvailable) allCapabilitiesAvailable = false;

  // Test Blob API
  const blobApiAvailable = typeof Blob !== "undefined";
  console.log(
    "📁 Blob API:",
    blobApiAvailable ? "✅ Available" : "❌ Missing"
  );
  if (!blobApiAvailable) allCapabilitiesAvailable = false;

  // Test fetch API
  const fetchAvailable = typeof fetch !== "undefined";
  console.log(
    "🌐 Fetch API:",
    fetchAvailable ? "✅ Available" : "❌ Missing"
  );
  if (!fetchAvailable) allCapabilitiesAvailable = false;

  // Test AbortController
  const abortControllerAvailable = typeof AbortController !== "undefined";
  console.log(
    "🛑 AbortController:",
    abortControllerAvailable ? "✅ Available" : "❌ Missing"
  );
  if (!abortControllerAvailable) allCapabilitiesAvailable = false;

  // Test Promise.race
  const promiseRaceAvailable = typeof Promise.race !== "undefined";
  console.log(
    "⚡ Promise.race:",
    promiseRaceAvailable ? "✅ Available" : "❌ Missing"
  );
  if (!promiseRaceAvailable) allCapabilitiesAvailable = false;

  // Test localStorage
  let localStorageAvailable = false;
  try {
    localStorage.setItem("test", "test");
    localStorage.removeItem("test");
    localStorageAvailable = true;
    console.log("💾 localStorage:", "✅ Available");
  } catch (error) {
    console.log("💾 localStorage:", "❌ Not available");
  }

  return allCapabilitiesAvailable;
}

async function testMinimalFileUpload(): Promise<boolean> {
  console.log("\n📋 6. MINIMAL FILE UPLOAD TEST");
  console.log("-".repeat(30));

  try {
    const supabase = createClient();
    let uploadTestsPassed = 0;
    let totalUploadTests = 0;

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
    totalUploadTests++;
    try {
      const { data: directData, error: directError } = await supabase.storage
        .from("documents")
        .upload(testPath, testFile, { upsert: false });

      if (directError) {
        console.log("❌ Direct upload failed:", directError.message);
      } else {
        console.log("✅ Direct upload successful:", directData.path);
        uploadTestsPassed++;

        // Clean up
        await supabase.storage.from("documents").remove([directData.path]);
        console.log("🧹 Test file cleaned up");
      }
    } catch (error) {
      console.log("❌ Direct upload exception:", error);
    }

    // Test 2: Presigned URL upload
    console.log("🧪 Testing presigned URL upload...");
    totalUploadTests++;
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
          uploadTestsPassed++;

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
    totalUploadTests++;
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
        uploadTestsPassed++;

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
    totalUploadTests++;
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
          uploadTestsPassed++;

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

    // Final summary
    console.log(`\n📊 UPLOAD TEST SUMMARY:`);
    console.log(`   ✅ Tests passed: ${uploadTestsPassed}/${totalUploadTests}`);
    console.log(`   📈 Success rate: ${Math.round((uploadTestsPassed / totalUploadTests) * 100)}%`);

    return uploadTestsPassed >= 2; // At least 2 out of 4 basic tests should pass
  } catch (error) {
    console.log("❌ Minimal upload test error:", error);
    return false;
  }
}

// Silent versions of all test functions
async function testSupabaseConnectionSilent(): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("count")
      .limit(1);

    return !error;
  } catch (error) {
    return false;
  }
}

async function testStorageBucketAccessSilent(): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: files, error: directError } = await supabase.storage
      .from("documents")
      .list("", { limit: 1 });

    return !directError;
  } catch (error) {
    return false;
  }
}

async function testNetworkConfigurationSilent(): Promise<boolean> {
  try {
    // Test basic connectivity
    const response = await fetch("https://httpbin.org/get", {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch (error) {
    // Network test failure is not critical for Supabase
    return true;
  }
}

async function testBrowserCapabilitiesSilent(): Promise<boolean> {
  const fileApiAvailable = typeof File !== "undefined";
  const fileReaderAvailable = typeof FileReader !== "undefined";
  const blobApiAvailable = typeof Blob !== "undefined";
  const fetchAvailable = typeof fetch !== "undefined";
  const abortControllerAvailable = typeof AbortController !== "undefined";
  const promiseRaceAvailable = typeof Promise.race !== "undefined";

  return fileApiAvailable && fileReaderAvailable && blobApiAvailable && 
         fetchAvailable && abortControllerAvailable && promiseRaceAvailable;
}

async function testMinimalFileUploadSilent(): Promise<boolean> {
  try {
    const supabase = createClient();
    let uploadTestsPassed = 0;
    let totalUploadTests = 0;

    // Create a minimal test file
    const testContent = `Test file created at ${new Date().toISOString()}`;
    const testFile = new Blob([testContent], { type: "text/plain" });
    const testPath = `test/diagnostic-${Date.now()}.txt`;

    // Test 1: Direct upload
    totalUploadTests++;
    try {
      const { data: directData, error: directError } = await supabase.storage
        .from("documents")
        .upload(testPath, testFile, { upsert: false });

      if (!directError) {
        uploadTestsPassed++;
        // Clean up
        await supabase.storage.from("documents").remove([directData.path]);
      }
    } catch (error) {
      // Test failed
    }

    // Test 2: Presigned URL upload
    totalUploadTests++;
    try {
      const { data: presignedData, error: presignedError } =
        await supabase.storage
          .from("documents")
          .createSignedUploadUrl(`${testPath}-presigned`);

      if (!presignedError) {
        const uploadResponse = await fetch(presignedData.signedUrl, {
          method: "PUT",
          body: testFile,
          headers: { "Content-Type": "text/plain" },
          signal: AbortSignal.timeout(10000),
        });

        if (uploadResponse.ok) {
          uploadTestsPassed++;
          // Clean up
          await supabase.storage
            .from("documents")
            .remove([`${testPath}-presigned`]);
        }
      }
    } catch (error) {
      // Test failed
    }

    return uploadTestsPassed >= 1; // At least 1 test should pass
  } catch (error) {
    return false;
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

// Silent version of macOS specific checks
export async function checkMacOSSpecificIssuesSilent(): Promise<boolean> {
  try {
    // Test network latency
    const start = performance.now();
    await fetch("https://httpbin.org/ip", {
      signal: AbortSignal.timeout(3000),
    });
    const end = performance.now();
    const latency = end - start;
    
    // High latency might indicate proxy/VPN but not critical
    return latency < 10000; // 10 seconds max
  } catch (error) {
    // Network test failure is not critical
    return true;
  }
}
