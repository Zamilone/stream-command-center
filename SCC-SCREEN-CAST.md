# SCC Screen Cast · plein écran

## Fonctionnement
SCC Screen Cast utilise `getDisplayMedia()` dans Chrome pour capturer l'écran choisi par l'utilisateur. Le flux vidéo est transmis directement entre le navigateur qui capture et la source navigateur PRISM avec WebRTC. Supabase Realtime Broadcast sert uniquement à échanger les descriptions de connexion WebRTC (SDP), pas à transporter la vidéo.

## Installation
Aucune migration SQL ni Edge Function supplémentaire n'est requise pour cette première version. Les deux pages utilisent le client Supabase et un canal Broadcast public avec un identifiant de salle aléatoire de 128 bits. L'URL de réception est donc un secret de type lien d'invitation : toute personne qui la possède peut regarder tant que le partage est actif. Ne la publie pas.

## Utilisation
1. Déployer le site sur HTTPS (GitHub Pages convient).
2. Ouvrir `screen-cast.html` depuis SCC Studio.
3. Copier l'URL de réception dans une source navigateur PRISM, idéalement en 1920×1080 ou 1280×720.
4. Laisser cette source ouverte et cliquer sur « Démarrer le partage » dans SCC.
5. Choisir l'écran, la fenêtre ou l'onglet dans le sélecteur Chrome.
6. Utiliser Pause/Reprendre ou Arrêter depuis SCC. Fermer la capture avec le sélecteur Chrome arrête également le partage.

## Limites connues de cette première version
- La capture nécessite un contexte sécurisé HTTPS et une autorisation explicite du navigateur.
- L'audio du partage dépend des options proposées par Chrome pour la surface sélectionnée et de l'autorisation cochée.
- Le transport WebRTC utilise un serveur STUN public, sans relais TURN. Le cas d'utilisation visé est la source navigateur PRISM sur le même ordinateur. Certains réseaux restrictifs peuvent empêcher l'établissement du flux.
- Le canal Realtime est public mais son topic est imprévisible (128 bits aléatoires). Il faut garder l'URL privée. Une version ultérieure pourra ajouter une authentification de salle et une meilleure gestion de reconnexion.
- Le flux n'est pas enregistré par SCC et n'est pas envoyé à Supabase Storage.

## Confidentialité
La capture commence uniquement après clic sur le bouton et sélection dans le sélecteur natif Chrome. Le bouton Arrêter coupe les pistes média et ferme le pair WebRTC. La fermeture de la page arrête également la capture.
