/**
 * Authentication module — Passport.js strategies + JWT helpers
 *
 * Supports:
 *  - Microsoft Entra ID (Azure AD) via OpenID Connect
 *  - GitHub OAuth
 *  - Google Workspace OAuth
 *  - AWS IAM Identity Center (via SAML)
 *
 * Roles:
 *  - Emails listed in ADMIN_EMAILS env var → admin
 *  - Everyone else → viewer
 */

const passport = require('passport');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '8h';
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ── Helpers ──────────────────────────────────────────────────

function getRole(email) {
  return ADMIN_EMAILS.includes((email || '').toLowerCase()) ? 'admin' : 'viewer';
}

function issueToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name, avatar: user.avatar, role: user.role, provider: user.provider },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/** Express middleware — attaches req.user or returns 401 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const user = verifyToken(authHeader.slice(7));
  if (!user) return res.status(401).json({ error: 'Invalid or expired token' });
  req.user = user;
  next();
}

/** Express middleware — requires admin role */
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// ── Normalise user from any provider ─────────────────────────

function normalizeUser(provider, profile) {
  const email = (
    profile.emails?.[0]?.value ||
    profile._json?.email ||
    profile._json?.preferred_username ||
    profile._json?.mail ||
    profile.upn ||
    ''
  ).toLowerCase();

  return {
    id: `${provider}:${profile.id || profile.nameID || profile._json?.oid || email}`,
    email,
    name: profile.displayName || profile._json?.name || email,
    avatar: profile.photos?.[0]?.value || profile._json?.picture || '',
    provider,
    role: getRole(email),
  };
}

// ── Callback handler shared by all strategies ────────────────

function oauthCallback(provider) {
  return (accessToken, refreshToken, profile, done) => {
    const user = normalizeUser(provider, profile);
    done(null, user);
  };
}

// ── Register strategies ──────────────────────────────────────

function setupStrategies(app) {
  app.use(passport.initialize());

  // ─ Microsoft Entra ID (Azure AD) ─
  if (process.env.AZURE_AD_CLIENT_ID) {
    const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
    passport.use('azure-ad', new OIDCStrategy({
      identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID || 'common'}/v2.0/.well-known/openid-configuration`,
      clientID: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      responseType: 'code',
      responseMode: 'query',
      redirectUrl: `${process.env.PROXY_BASE_URL || 'http://localhost:3001'}/api/auth/azure-ad/callback`,
      scope: ['openid', 'profile', 'email'],
      passReqToCallback: false,
      allowHttpForRedirectUrl: true,
    }, (iss, sub, profile, accessToken, refreshToken, done) => {
      const user = normalizeUser('azure-ad', profile);
      done(null, user);
    }));

    app.get('/api/auth/azure-ad', passport.authenticate('azure-ad'));
    app.get('/api/auth/azure-ad/callback',
      passport.authenticate('azure-ad', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=auth_failed` }),
      handleAuthSuccess
    );
    // Also handle POST callbacks from Azure AD
    app.post('/api/auth/azure-ad/callback',
      passport.authenticate('azure-ad', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=auth_failed` }),
      handleAuthSuccess
    );
  }

  // ─ GitHub ─
  if (process.env.GITHUB_CLIENT_ID) {
    const GitHubStrategy = require('passport-github2').Strategy;
    passport.use('github', new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.PROXY_BASE_URL || 'http://localhost:3001'}/api/auth/github/callback`,
      scope: ['user:email'],
    }, oauthCallback('github')));

    app.get('/api/auth/github', passport.authenticate('github'));
    app.get('/api/auth/github/callback',
      passport.authenticate('github', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=auth_failed` }),
      handleAuthSuccess
    );
  }

  // ─ Google Workspace ─
  if (process.env.GOOGLE_CLIENT_ID) {
    const GoogleStrategy = require('passport-google-oauth20').Strategy;
    passport.use('google', new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.PROXY_BASE_URL || 'http://localhost:3001'}/api/auth/google/callback`,
      scope: ['profile', 'email'],
    }, oauthCallback('google')));

    app.get('/api/auth/google', passport.authenticate('google'));
    app.get('/api/auth/google/callback',
      passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=auth_failed` }),
      handleAuthSuccess
    );
  }

  // ─ AWS IAM Identity Center (SAML) ─
  if (process.env.AWS_SSO_ENTRY_POINT) {
    const SamlStrategy = require('passport-saml').Strategy;
    passport.use('aws-sso', new SamlStrategy({
      entryPoint: process.env.AWS_SSO_ENTRY_POINT,
      issuer: process.env.AWS_SSO_ISSUER || 'qa-dashboard',
      callbackUrl: `${process.env.PROXY_BASE_URL || 'http://localhost:3001'}/api/auth/aws-sso/callback`,
      cert: process.env.AWS_SSO_CERT || '',
    }, (profile, done) => {
      const user = normalizeUser('aws-sso', profile);
      done(null, user);
    }));

    app.get('/api/auth/aws-sso', passport.authenticate('aws-sso'));
    app.post('/api/auth/aws-sso/callback',
      passport.authenticate('aws-sso', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=auth_failed` }),
      handleAuthSuccess
    );
  }

  // ── Auth info endpoints ────────────────────────────────────

  /** Returns which providers are configured (no secrets) */
  app.get('/api/auth/providers', (req, res) => {
    const providers = [];
    if (process.env.AZURE_AD_CLIENT_ID)   providers.push({ id: 'azure-ad', name: 'Microsoft Entra ID', icon: 'microsoft' });
    if (process.env.GITHUB_CLIENT_ID)     providers.push({ id: 'github',   name: 'GitHub',             icon: 'github' });
    if (process.env.GOOGLE_CLIENT_ID)     providers.push({ id: 'google',   name: 'Google Workspace',   icon: 'google' });
    if (process.env.AWS_SSO_ENTRY_POINT)  providers.push({ id: 'aws-sso',  name: 'AWS IAM Identity Center', icon: 'aws' });
    res.json({ providers });
  });

  /** Verify token & return current user */
  app.get('/api/auth/me', requireAuth, (req, res) => {
    res.json({ user: req.user });
  });

  /** Logout — client just discards the token, but this endpoint can be used for audit */
  app.post('/api/auth/logout', (req, res) => {
    res.json({ ok: true });
  });
}

/** After successful OAuth, redirect to frontend with JWT */
function handleAuthSuccess(req, res) {
  const token = issueToken(req.user);
  res.redirect(`${FRONTEND_URL}/auth/callback?token=${encodeURIComponent(token)}`);
}

module.exports = { setupStrategies, requireAuth, requireAdmin, verifyToken, issueToken };
