import { UserType } from '../users/model';

export default ({
  object,
  message,
  url,
  user,
}: {
  object: string;
  message: string;
  url: string;
  user: UserType;
}) => ({
  subject: 'SEEDS - Message utilisateur',

  text: `Nouveau message envoyé par un utilisateur`,

  html: `<p><u>Utilisateur :</u></p>
  <p>${user.email} / ${user.firstName} ${user.lastName} / ${user.company}</p>
  <br/>

  <p><u>Objet du message :</u></p>
  <p>${object}</p>
  <br/>

  <p><u>Message :</u></p>
  <p>${message}</p>
  <br/>

  <p><u>Url de la page d'où le message a été envoyé :</u></p>
  <p>${url}</p>
  <br/>
      `,
});
