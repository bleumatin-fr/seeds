export default (token: string) => ({
  subject: 'SEEDS - Création de compte',

  text: `
  Vous recevez cet email car vous avez été invités à utiliser SEEDS.
  
  Veuillez cliquer sur le lien ci-dessous, ou copier/coller dans votre navigateur pour compléter le processus:
  ${process.env.FRONTEND_URL}/authentication/confirm-account/${token}
  
  Si vous n'avez pas demandé cela, veuillez ignorer cet email.
`,

  html: `
  <p>Vous recevez cet email car vous avez été invités à utiliser SEEDS.</p>
  <p>Veuillez cliquer sur le lien ci-dessous, ou copier/coller dans votre navigateur pour compléter le processus:</p>
  <p><a href="${process.env.FRONTEND_URL}/authentication/confirm-account/${token}">${process.env.FRONTEND_URL}/authentication/confirm-account/${token}</a></p>
  <p>Si vous n'avez pas demandé cela, veuillez ignorer cet
  email.</p>
`,
});
