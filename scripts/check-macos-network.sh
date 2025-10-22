#!/bin/bash

echo "🍎 MACOS NETWORK DIAGNOSTICS FOR SUPABASE UPLOADS"
echo "=================================================="

echo ""
echo "📋 1. BASIC NETWORK INFO"
echo "------------------------"
echo "🌐 Active Network Interface:"
route get default | grep interface | awk '{print $2}'

echo ""
echo "🔍 DNS Configuration:"
scutil --dns | grep nameserver | head -5

echo ""
echo "📋 2. PROXY SETTINGS CHECK"
echo "-------------------------"
echo "🔍 HTTP Proxy:"
networksetup -getwebproxy "Wi-Fi" 2>/dev/null || echo "No HTTP proxy configured"

echo ""
echo "🔍 HTTPS Proxy:"
networksetup -getsecurewebproxy "Wi-Fi" 2>/dev/null || echo "No HTTPS proxy configured"

echo ""
echo "🔍 SOCKS Proxy:"
networksetup -getsocksfirewallproxy "Wi-Fi" 2>/dev/null || echo "No SOCKS proxy configured"

echo ""
echo "📋 3. FIREWALL STATUS"
echo "--------------------"
echo "🔥 Application Firewall:"
/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

echo ""
echo "🔥 Stealth Mode:"
/usr/libexec/ApplicationFirewall/socketfilterfw --getstealthmode

echo ""
echo "📋 4. LITTLE SNITCH / NETWORK MONITORS"
echo "-------------------------------------"
if pgrep -f "Little Snitch" > /dev/null; then
    echo "⚠️ Little Snitch is running - may block uploads"
else
    echo "✅ Little Snitch not detected"
fi

if pgrep -f "Radio Silence" > /dev/null; then
    echo "⚠️ Radio Silence is running - may block uploads"
else
    echo "✅ Radio Silence not detected"
fi

if pgrep -f "Hands Off" > /dev/null; then
    echo "⚠️ Hands Off is running - may block uploads"
else
    echo "✅ Hands Off not detected"
fi

echo ""
echo "📋 5. SUPABASE CONNECTIVITY TEST"
echo "--------------------------------"
echo "🧪 Testing Supabase endpoint connectivity..."

# Test basic connectivity to Supabase
SUPABASE_URL="lvolcmybuegslwequhce.supabase.co"
echo "🔍 Ping test to $SUPABASE_URL:"
ping -c 3 $SUPABASE_URL

echo ""
echo "🔍 HTTP connectivity test:"
curl -I "https://$SUPABASE_URL" --connect-timeout 10 --max-time 30

echo ""
echo "🔍 Storage endpoint test:"
curl -I "https://$SUPABASE_URL/storage/v1/object" --connect-timeout 10 --max-time 30

echo ""
echo "📋 6. BROWSER PROCESS CHECK"
echo "--------------------------"
echo "🔍 Chrome/Chromium processes:"
ps aux | grep -i chrome | grep -v grep | wc -l | xargs echo "Chrome processes:"

echo ""
echo "🔍 Safari processes:"
ps aux | grep -i safari | grep -v grep | wc -l | xargs echo "Safari processes:"

echo ""
echo "📋 7. SYSTEM RESOURCES"
echo "---------------------"
echo "💾 Available Memory:"
vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//' | xargs -I {} echo "scale=2; {} * 4096 / 1024 / 1024" | bc | xargs echo "MB free"

echo ""
echo "💽 Disk Space:"
df -h / | tail -1 | awk '{print "Available: " $4 " (" $5 " used)"}'

echo ""
echo "🔥 CPU Load:"
uptime

echo ""
echo "=================================================="
echo "✅ DIAGNOSTICS COMPLETED"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Check for proxy/firewall blocking uploads"
echo "2. Verify Supabase connectivity is working"
echo "3. Run browser diagnostics in Developer Tools"
echo "4. If Little Snitch is detected, check its rules"
echo "=================================================="
