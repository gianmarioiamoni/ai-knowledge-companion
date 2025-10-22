import { createClient } from "@/lib/supabase/client";

export async function testSupabaseConnectivity() {
  console.log("🧪 Testing Supabase connectivity...");

  try {
    const supabase = createClient();

    // Test 1: Basic connection
    console.log("1️⃣ Testing basic connection...");
    const { data: healthCheck, error: healthError } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    if (healthError) {
      console.error("❌ Database connection failed:", healthError);
    } else {
      console.log("✅ Database connection OK");
    }

    // Test 2: Storage bucket access
    console.log("2️⃣ Testing storage bucket access...");
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error("❌ Storage bucket access failed:", bucketsError);
    } else {
      console.log(
        "✅ Storage buckets accessible:",
        buckets?.map((b) => b.name)
      );
    }

    // Test 3: Documents bucket specific test
    console.log("3️⃣ Testing documents bucket...");
    const { data: files, error: filesError } = await supabase.storage
      .from("documents")
      .list("", { limit: 1 });

    if (filesError) {
      console.error("❌ Documents bucket access failed:", filesError);
    } else {
      console.log("✅ Documents bucket accessible");
    }

    // Test 4: Small file upload test
    console.log("4️⃣ Testing small file upload...");
    const testFile = new File(["test content"], "test.txt", {
      type: "text/plain",
    });
    const testPath = `test-${Date.now()}.txt`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(testPath, testFile);

    if (uploadError) {
      console.error("❌ Small file upload failed:", uploadError);
    } else {
      console.log("✅ Small file upload successful:", uploadData);

      // Clean up test file
      await supabase.storage.from("documents").remove([testPath]);
      console.log("🧹 Test file cleaned up");
    }

    return {
      database: !healthError,
      storage: !bucketsError,
      documents: !filesError,
      upload: !uploadError,
    };
  } catch (error) {
    console.error("❌ Connectivity test failed:", error);
    return {
      database: false,
      storage: false,
      documents: false,
      upload: false,
    };
  }
}
