# 🔐 Stripe Restricted Key Setup

Guide for creating a restricted API key with minimum necessary permissions for AI Knowledge Companion.

---

## 🎯 Why Use Restricted Keys?

**Security Benefits:**
- ✅ **Least Privilege Principle**: Only the permissions you need
- ✅ **Reduced Blast Radius**: Limited damage if key is compromised
- ✅ **Audit Trail**: Clear visibility of what the key can do
- ✅ **Compliance**: Required by PCI DSS and security best practices

**Comparison:**

| Standard Key | Restricted Key |
|--------------|----------------|
| ⚠️ Full access to all Stripe APIs | ✅ Only specified operations |
| ⚠️ Can delete products, refund any payment, access all data | ✅ Cannot perform unauthorized operations |
| ⚠️ High risk if exposed | ✅ Limited risk if exposed |

---

## 📋 Required Permissions for AI Knowledge Companion

### **Core Operations**

Our application needs to:
1. ✅ Create checkout sessions (for new subscriptions)
2. ✅ Create and update customers
3. ✅ Manage subscriptions (create, update, cancel)
4. ✅ Read products and prices
5. ✅ Create billing portal sessions
6. ✅ Process webhooks (read events)

---

## 🔑 Step-by-Step: Create Restricted Key

### **1. Navigate to Developers → API Keys**

1. **Stripe Dashboard** → Toggle to **Live Mode**
2. **Developers** → **API keys**
3. Click **+ Create restricted key**

### **2. Configure Key Settings**

**Key Name**: `AI Knowledge Companion - Production (Restricted)`

### **3. Set Permissions**

#### **✅ Core Resources (Write Access)**

Enable **Write** permissions for:

```
☑️ Checkout Sessions
   - Create checkout sessions for new subscriptions
   
☑️ Customers
   - Create and update customer records
   
☑️ Subscriptions
   - Create, update, and cancel subscriptions
   
☑️ Billing Portal (Portal Sessions)
   - Generate billing portal sessions for customers
```

#### **✅ Read-Only Resources**

Enable **Read** permissions for:

```
☑️ Products
   - Read product information
   
☑️ Prices
   - Read pricing information
   
☑️ Payment Intents
   - Read payment status
   
☑️ Invoices
   - Read invoice information
   
☑️ Events
   - Process webhook events
```

#### **❌ Deny All Other Permissions**

Leave **unchecked** (deny):
- ❌ Refunds (handle manually in Stripe Dashboard if needed)
- ❌ Payment Methods (managed by Checkout/Portal)
- ❌ Products (Write) - Don't allow app to modify products
- ❌ Charges (Write) - Use Payment Intents instead
- ❌ All admin operations (Account, Applications, etc.)

---

## 📝 Detailed Permission Matrix

### **Required Permissions Table**

| Resource | Permission | Reason |
|----------|-----------|--------|
| **Checkout Sessions** | ✅ Write | Create sessions when users click "Subscribe" |
| **Customers** | ✅ Write | Create customer record on first purchase |
| **Subscriptions** | ✅ Write | Create/update/cancel subscriptions |
| **Billing Portal Sessions** | ✅ Write | Generate portal links for subscription management |
| **Products** | ✅ Read | Display plan information |
| **Prices** | ✅ Read | Show pricing in UI |
| **Payment Intents** | ✅ Read | Track payment status |
| **Invoices** | ✅ Read | Show billing history |
| **Events** | ✅ Read | Process webhook events |
| **Refunds** | ❌ None | Handle manually (rare operation) |
| **Payment Methods** | ❌ None | Managed by Checkout/Portal |
| **Products (Write)** | ❌ None | Products managed via Dashboard |

---

## 🔑 Example Restricted Key Configuration

### **Visual Checklist**

```
API Key: AI Knowledge Companion - Production (Restricted)
Environment: Live Mode

Permissions:
├─ Core Resources (Write)
│  ├─ [x] Checkout Sessions
│  ├─ [x] Customers
│  ├─ [x] Subscriptions
│  └─ [x] Portal Sessions (Billing Portal)
│
├─ Core Resources (Read)
│  ├─ [x] Products
│  ├─ [x] Prices
│  ├─ [x] Payment Intents
│  ├─ [x] Invoices
│  └─ [x] Events
│
└─ Denied Resources
   ├─ [ ] Refunds
   ├─ [ ] Products (Write)
   ├─ [ ] Charges (Write)
   ├─ [ ] Payment Methods (Write)
   └─ [ ] All Admin Resources
```

---

## 🚀 Create the Key

### **Step 4: Create and Copy**

1. **Review** all permissions
2. Click **Create key**
3. **Copy the secret key**: `sk_live_...`

⚠️ **IMPORTANT**: 
- This key will only be shown **once**
- Store it securely
- Add it to Vercel immediately
- Never commit to Git

### **Step 5: Update Vercel Environment Variables**

```bash
# In Vercel Dashboard → Environment Variables → Production
STRIPE_SECRET_KEY=sk_live_51Xxxxxx...  # ← Your new restricted key
```

### **Step 6: Redeploy**

```bash
git commit --allow-empty -m "chore: update to restricted Stripe key"
git push
```

---

## ✅ Verify Key Works

### **Test Checkout Flow**

1. **Create a test subscription** (€19 Pro plan recommended)
2. **Verify operations**:
   - ✅ Checkout session created
   - ✅ Customer created in Stripe
   - ✅ Subscription created
   - ✅ Webhook events received
   - ✅ User can access Billing Portal

3. **Cancel test subscription**
4. **Verify cancellation** works

---

## 🔒 Security Best Practices

### **Key Management**

1. **Use Different Keys per Environment**:
   ```
   Production:  sk_live_51... (Restricted)
   Preview:     sk_test_51... (Standard OK)
   Development: sk_test_51... (Standard OK)
   ```

2. **Rotate Keys Regularly**:
   - Rotate every 90 days (recommended)
   - Rotate immediately if:
     - Key might have been exposed
     - Employee with access leaves
     - Security incident detected

3. **Monitor Key Usage**:
   - Stripe Dashboard → Developers → API logs
   - Set up alerts for unusual activity
   - Review logs weekly

### **Forbidden Actions**

❌ **NEVER**:
- Commit keys to Git (even in `.env.local`)
- Share keys via email/Slack
- Use production keys in development
- Store keys in browser localStorage
- Log keys in application logs

✅ **ALWAYS**:
- Store keys in environment variables
- Use secrets management (Vercel Env Vars)
- Restrict access to who needs it
- Enable Stripe email alerts

---

## 🚨 What If Key Is Compromised?

### **Immediate Actions**

1. **Revoke the Key**:
   - Stripe Dashboard → Developers → API keys
   - Find the key → **Revoke**

2. **Create New Restricted Key**:
   - Follow steps above
   - Use same permissions

3. **Update Vercel**:
   - Add new key
   - Remove old key
   - Redeploy

4. **Monitor for Abuse**:
   - Check Stripe logs for unauthorized operations
   - Review recent payments/refunds
   - Check for suspicious customers

5. **Notify if Needed**:
   - If abuse detected, contact Stripe support
   - Document incident

---

## 📊 Permission Audit

### **Periodic Review (Every 3 months)**

Ask yourself:
- [ ] Are all write permissions still necessary?
- [ ] Can any permission be downgraded to read-only?
- [ ] Are there unused permissions that can be removed?
- [ ] Is the key still actively used?
- [ ] Has team access changed?

---

## 🆚 Standard vs Restricted: Real Example

### **Scenario: Key Exposed on GitHub**

**With Standard Key** (`sk_live_standard...`):
```
⚠️ Attacker can:
- Delete all products
- Refund all payments
- Access all customer data
- Modify prices
- Cancel all subscriptions
- Create fraudulent charges

💰 Potential damage: UNLIMITED
```

**With Restricted Key** (`sk_live_restricted...`):
```
✅ Attacker can ONLY:
- Create checkout sessions (which require valid customer email)
- Read public product/price data

❌ Attacker CANNOT:
- Delete products
- Issue refunds
- Modify prices
- Access sensitive customer data (limited)

💰 Potential damage: MINIMAL
```

---

## 🎯 Summary

### **TL;DR**

✅ **Use Restricted Keys** for production  
✅ **Grant minimum permissions** needed  
✅ **Rotate keys** every 90 days  
✅ **Monitor usage** regularly  
✅ **Revoke immediately** if compromised  

### **For AI Knowledge Companion**

**Required Permissions:**
- **Write**: Checkout Sessions, Customers, Subscriptions, Portal Sessions
- **Read**: Products, Prices, Payment Intents, Invoices, Events

**Time to Setup**: ~5 minutes  
**Security Improvement**: ⭐⭐⭐⭐⭐ (Massive)

---

## 📚 Additional Resources

- **Stripe Restricted Keys**: https://stripe.com/docs/keys#limit-access
- **Security Best Practices**: https://stripe.com/docs/security/guide
- **PCI Compliance**: https://stripe.com/docs/security/pci

---

**Last Updated**: November 2025

