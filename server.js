const express = require('express');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const session = require('express-session');

const app = express();

// Configura la sesión
app.use(session({
    secret: 'topsecret',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Configura Passport con la estrategia de Discord
passport.use(new DiscordStrategy({
    clientID: '1247270645226672139',
    clientSecret: 'qJ_YKOvft9S3lRFMmEeUDllWA3p-G1Vf',
    callbackURL: 'https://discord.com/oauth2/authorize?client_id=1247270645226672139&response_type=code&redirect_uri=https%3A%2F%2Fdiscord.gg%2FjrmkgXkVkW&scope=identify+guilds+guilds.join+email+connections',
    scope: ['identify']
}, function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Ruta de autenticación
app.get('/auth/discord', passport.authenticate('discord'));

// Ruta de callback
app.get('/auth/discord/callback', passport.authenticate('discord', {
    failureRedirect: '/'
}), (req, res) => {
    res.redirect('/');
});

// Ruta para obtener la información del usuario autenticado
app.get('/user', (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: 'Unauthorized' });
    res.json(req.user);
});

// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

// Servir archivos estáticos (tu frontend)
app.use(express.static('public'));

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});



npm install express passport passport-discord express-session
