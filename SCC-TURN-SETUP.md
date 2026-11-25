# SCC Screen Cast · configuration du relais TURN

Le relais TURN permet au PC et à la source navigateur PRISM de transporter la vidéo même lorsque leur connexion WebRTC directe est bloquée.

## 1. Créer une credential Metered

1. Crée un compte sur https://dashboard.metered.ca/signup
2. Ouvre **TURN Server → Credentials**.
3. Crée une credential TURN.
4. Dans **Get credential**, récupère son **API Key** (la clé propre à cette credential).
5. Récupère aussi le domaine de ton application, au format `monapp.metered.live`, dans **Developers**.

La clé API de credential est différente de la Secret Key générale Metered. SCC conserve cette clé côté serveur, dans Supabase. Ne la colle jamais dans GitHub ni dans le code du site.

Documentation officielle :
- [Créer une credential TURN](https://www.metered.ca/docs/turn-server-service/creating-turn-credentials/)
- [Récupérer les serveurs ICE](https://www.metered.ca/docs/turn-rest-api/get-credential/)

## 2. Ajouter les secrets dans Supabase

Dans Supabase → **Project Settings → Edge Functions → Secrets** (ou **Edge Functions → Secrets** selon l'interface), ajoute :

| Nom | Valeur |
| --- | --- |
| `METERED_DOMAIN` | Le domaine complet, par exemple `monapp.metered.live` |
| `METERED_TURN_API_KEY` | L'API Key de la credential TURN, pas la Secret Key générale |

La fonction utilise la région par défaut configurée dans Metered ou celle attribuée à la credential. Cela permet également de fonctionner avec les offres qui n'autorisent que la région Standard.

## 3. Fonction Edge Supabase

La fonction `scc-turn-credentials` est déjà déployée sur le projet SCC avec **Verify JWT activé**. Elle :
- vérifie que l'appelant possède une session SCC valide ;
- récupère la liste des serveurs ICE auprès de Metered ;
- ne renvoie que la configuration ICE nécessaire à WebRTC ;
- ne renvoie jamais l'API Key Metered.

Le navigateur transmet ensuite la configuration ICE à la source PRISM via le canal Realtime privé de la salle.

## 4. Utiliser Screen Cast

1. Ajoute les deux secrets ci-dessus dans Supabase.
2. Connecte-toi au dashboard SCC.
3. Ouvre SCC Studio puis Screen Cast.
4. Recharge la page, démarre le partage et autorise Chrome à capturer ton écran.
5. Ouvre la même URL de réception dans PRISM.

Le partage vidéo reste en WebRTC. Supabase Realtime ne transporte que la signalisation.

## Confidentialité et consommation

- L'URL de réception est un lien secret : toute personne qui la possède peut rejoindre la salle pendant le partage.
- Les identifiants ICE TURN sont transmis au récepteur dans le canal privé de cette salle. Ne publie pas l'URL. Si elle est divulguée, révoque/renouvelle la credential Metered.
- TURN relaie le flux vidéo et consomme du trafic. Surveille la consommation et les limites de ton offre Metered.
- Si tu viens de créer une credential, Metered indique qu'elle peut nécessiter jusqu'à 2 minutes pour se propager.
- Un vrai test Chrome + Xiaomi + PRISM reste nécessaire après configuration des secrets.
