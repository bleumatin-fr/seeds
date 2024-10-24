import { Project } from '@arviva/core';
import { UserType } from '../users/model';

export default ({
  project,
  invitedUser,
  invitingUser,
  message,
  token,
}: {
  project: Project;
  invitingUser: UserType;
  invitedUser: UserType;
  message: string;
  token: string;
}) => {
  return {
    subject: `SEEDS - Invitation au projet ${project.name}`,

    text: `Bonjour ${invitedUser.firstName} ${invitedUser.lastName},

Cette invitation vous est envoyée par {invitingUser.firstName} ${invitingUser.lastName} qui vous convie à collaborer au projet ${project.name} sur SEEDS (Simulateur d'Empreinte Environnementale du Spectacle).
${message ? `"${message}"` : null}

Votre collaboration sera précieuse - connectez-vous sur SEEDS pour le retrouver ! 
${process.env.FRONTEND_URL}/authentication/confirm-account/${token}

Pour toute question ou demande relative à l'outil, vous pouvez nous écrire à seeds@arviva.org ou consulter les ressources dédiées. 

A bientôt !

Arviva
    `,

    html: `<p>Bonjour ${invitedUser.firstName} ${invitedUser.lastName},</p>
        <br/>
    
      <p>Cette invitation vous est envoyée par ${invitingUser.firstName} ${invitingUser.lastName} qui vous convie à collaborer au projet <b>${project.name}</b> sur SEEDS (Simulateur d'Empreinte Environnementale du Spectacle).</p> 
      <br/>

      ${message ? `<p>"${message}".</p><br/>` : ''}
    
      <p><b>Votre collaboration sera précieuse - connectez-vous sur <a href="${process.env.FRONTEND_URL}/authentication/confirm-account/${token}">SEEDS</a> pour le retrouver ! </b></p>
      <br/>
    
      <p>Pour toute question ou demande relative à l'outil, vous pouvez nous écrire à <a href="mailto:seeds@arviva.org">seeds@arviva.org</a> ou consulter les <a href="https://arviva.org/seeds">ressources dédiées.</a></p>
      <br/>

      <p>À bientôt !</p>
      <br/>
      
      <p>Arviva</p>
          `,
  };
};
