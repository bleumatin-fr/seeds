export default (token: string) => ({
  subject: 'SEEDS - Récupération mot de passe',

  text: `Vous recevez cet email car vous (ou quelqu'un d'autre) avez demandé la réinitialisation du mot de passe de votre compte.

Veuillez cliquer sur le lien ci-dessous, ou copier/coller dans votre navigateur pour compléter le processus:
${process.env.FRONTEND_URL}/authentication/reset-password/${token}

Si vous n'avez pas demandé cela, veuillez ignorer cet email et votre mot de passe restera inchangé.`,

  html: `<p>Vous recevez cet email car vous (ou quelqu'un d'autre) avez demandé la réinitialisation du mot de passe de votre compte.</p>
<p>Veuillez cliquer sur le lien ci-dessous, ou copier/coller dans votre navigateur pour compléter le processus:</p>
<p><a href="${process.env.FRONTEND_URL}/authentication/reset-password/${token}">${process.env.FRONTEND_URL}/reset-password?token=${token}</a></p>
<p>Si vous n'avez pas demandé cela, veuillez ignorer cet email et votre mot de passe restera inchangé.</p>
    `,
});
