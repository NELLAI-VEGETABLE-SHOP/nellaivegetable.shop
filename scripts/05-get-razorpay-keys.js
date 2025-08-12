// Script to fetch and display Razorpay keys from CSV
async function getRazorpayKeys() {
  try {
    console.log("Fetching Razorpay keys from CSV...")

    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/rzplive-GwZ29x23N9qWtmrMdmYTnyYaorRuOJ.csv",
    )
    const csvText = await response.text()

    console.log("CSV content:", csvText)

    // Parse CSV
    const lines = csvText.trim().split("\n")
    const headers = lines[0].split(",")
    const data = lines[1].split(",")

    const keys = {}
    headers.forEach((header, index) => {
      keys[header] = data[index]
    })

    console.log("Parsed Razorpay keys:", keys)

    console.log("\nEnvironment variables to set:")
    console.log(`NEXT_PUBLIC_RAZORPAY_KEY_ID=${keys.key_id}`)
    console.log(`RAZORPAY_KEY_SECRET=${keys.key_secret}`)

    return keys
  } catch (error) {
    console.error("Error fetching Razorpay keys:", error)
  }
}

// Execute the function
getRazorpayKeys()
