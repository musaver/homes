# Google Maps Setup Guide

## Prerequisites

To use Google Maps on the checkout page, you need to set up a Google Maps API key.

## Steps to Set Up Google Maps API

### 1. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one

### 2. Enable Required APIs
Enable the following APIs in your Google Cloud project:
- **Maps JavaScript API**
- **Places API** 
- **Geocoding API**

### 3. Create API Key
1. Go to "Credentials" in the Google Cloud Console
2. Click "Create Credentials" → "API Key"
3. Copy the generated API key

### 4. Configure API Key Restrictions (Recommended)
1. Click on your API key to edit it
2. Under "Application restrictions", select "HTTP referrers"
3. Add your domain(s):
   - `localhost:3000/*` (for development)
   - `yourdomain.com/*` (for production)

### 5. Set Environment Variable

#### For Development:
Create a `.env.local` file in your project root with:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

#### For Production:
Set the environment variable in your hosting platform:
- **Vercel**: Go to Project Settings → Environment Variables
- **Netlify**: Go to Site Settings → Environment Variables  
- **AWS/Digital Ocean**: Set via your deployment configuration
- **Docker**: Add to your docker-compose.yml or Dockerfile

The environment variable MUST be named exactly: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

## Features Implemented

The Google Maps integration on the checkout page includes:

1. **Address Autocomplete**: Start typing and get address suggestions
2. **Interactive Map**: Visual map with draggable marker
3. **Current Location**: Use GPS to get current location
4. **Address Validation**: Ensures valid addresses are selected

## Troubleshooting

### Common Issues:

1. **No autocomplete suggestions**:
   - Check if Places API is enabled
   - Verify API key is correct
   - Check browser console for errors

2. **Map not loading**:
   - Check if Maps JavaScript API is enabled
   - Verify API key restrictions
   - Check network connectivity

3. **Geocoding not working**:
   - Check if Geocoding API is enabled
   - Verify API quotas

### Console Errors:
- Open browser developer tools (F12)
- Check Console tab for Google Maps errors
- Common errors and solutions:
  - `InvalidKeyMapError`: API key is invalid or missing
  - `ApiNotActivatedMapError`: Required API not enabled
  - `RefererNotAllowedMapError`: Domain not allowed in API key restrictions

### Works on Localhost but Not on Live Site:

This is the most common issue and usually means:

1. **Environment Variable Not Set**: The `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` environment variable is not configured on your live server
2. **Domain Restrictions**: Your API key has domain restrictions that don't include your live domain
3. **API Key Restrictions**: The API key is restricted to localhost only

**Solution Steps:**
1. Verify the environment variable is set on your live server
2. Check your Google Cloud Console → Credentials → Your API Key → Restrictions
3. Add your live domain to the "HTTP referrers" list (e.g., `yourdomain.com/*`)
4. Redeploy your application after making changes

## Cost Considerations

Google Maps APIs have usage-based pricing:
- Maps JavaScript API: $7 per 1,000 loads
- Places API: $17 per 1,000 requests
- Geocoding API: $5 per 1,000 requests

Google provides $200 monthly credit which covers most small to medium applications.

## Security Best Practices

1. **Restrict API Key**: Always set up domain restrictions
2. **Monitor Usage**: Set up billing alerts
3. **Use Environment Variables**: Never commit API keys to version control
4. **Limit API Scope**: Only enable APIs you actually use 