# SCC Studio avancé : installation et limites actuelles

## 1. Activer la médiathèque

1. Ouvre ton projet Supabase.
2. Va dans **SQL Editor**.
3. Ouvre le fichier `scc-media-setup.sql` du dépôt.
4. Copie tout son contenu dans une nouvelle requête SQL, puis exécute-la.
5. Recharge SCC Studio. La médiathèque doit pouvoir lister et importer tes fichiers.

Le bucket `scc-media` est public en lecture afin que l'overlay PRISM puisse lire les médias sans session Supabase. L'import, la liste et la suppression restent limités au dossier correspondant à l'utilisateur connecté. La limite configurée est de 50 Mo par fichier.

Formats prévus :
- Images : PNG, JPG/JPEG, GIF, WebP
- Vidéos : MP4, WebM
- Sons : MP3, OGG, WAV

## 2. Configurer les alertes

Dans SCC Studio, choisis un type d'événement, règle le titre, le message, la durée, l'animation, l'image et le son, puis clique sur **Enregistrer l'alerte**. Les variables de texte disponibles sont `{name}`, `{amount}`, `{message}`, `{viewers}` et `{tier}`.

Le bouton **Tester cette alerte** envoie un événement de test dans l'état partagé : il ne crée pas un vrai événement Twitch.

## 3. Alertes natives Twitch et SCC

Les alertes configurées dans le tableau de bord Twitch sont un système distinct. Twitch fournit une URL de source navigateur à copier dans le logiciel de streaming. SCC ne peut pas lire automatiquement les images, sons, variantes ou règles enregistrés dans l'éditeur Twitch. Tu peux conserver cette URL dans le champ prévu et ajouter la source Twitch séparément dans PRISM.

SCC Studio, lui, affiche ses propres alertes à partir des événements reçus par ton webhook Twitch EventSub. Le champ URL Twitch ne fusionne pas les deux systèmes et ne transforme pas la source Twitch en widget SCC.

## 4. Événements Twitch et autorisations

La version actuelle de l'intégration SCC a déjà été mise en place autour des notifications de followers et des autorisations d'abonnement. L'interface de Studio permet maintenant de préparer les styles pour :
- follow
- abonnement
- réabonnement
- abonnement offert
- Bits / Cheer
- raid

**Important :** le fait qu'un type apparaisse dans la liste de Studio ne crée pas automatiquement son abonnement EventSub côté Twitch. Les notifications supplémentaires doivent être ajoutées à la fonction Edge `twitch-eventsub-setup`, et leur payload doit être normalisé dans `twitch-events`. Les autorisations EventSub sont différentes selon le type : par exemple, les follows demandent `moderator:read:followers`, les abonnements `channel:read:subscriptions`, et les Cheers `bits:read`. Les raids n'ont pas de scope utilisateur obligatoire. Ne considère pas un type comme actif tant qu'il n'a pas été souscrit et testé réellement.

## 5. Test en direct

1. Connecte-toi au dashboard SCC, puis ouvre Studio dans le même navigateur.
2. Importe un petit fichier PNG/GIF et un MP3.
3. Associe-les à l'alerte Follow et enregistre.
4. Clique sur **Tester cette alerte**.
5. Vérifie l'overlay PRISM. Autorise la lecture audio si le navigateur demande une interaction.
6. Ensuite, déclenche un vrai follow de test et compare avec l'événement simulé.

Ne place jamais une clé secrète Supabase ou un jeton Twitch dans le code HTML ou dans un champ public.
