# SCC Screen Cast · configuration du relais TURN

Le relais TURN permet au PC et à la source navigateur PRISM de transporter la vidéo même lorsque leur connexion WebRTC directe est bloquée.

## 1. Créer une credential Metered

1. Crée un compte sur https://dashboard.metered.ca/signup
2. Ouvre **TURN Server → Credentials**.
3. Crée une credential TURN et attends jusqu'à 2 minutes que sa propagation soit terminée.
4. Ouvre **Get credential → Show API Key** et copie la clé API de cette credential.
5. Dans **Developers**, récupère le domaine de ton application, au format `monapp.metered.live`.

La clé API de credential est différente de la Secret Key générale Metered. SCC utilise uniquement la clé API de credential. Ne colle aucune clé dans GitHub ni dans le code du site.

Documentation Metered :
- https://www.metered.ca/docs/turn-server-service/creating-turn-credentials/
- https://www.metered.ca/docs/turn-rest-api/get-credential/

## 2. Ajouter les secrets dans Supabase

Dans Supabase → **Project Settings → Edge Functions → Secrets** (ou **Edge Functions → Secrets** selon l'interface), ajoute :

| Nom | Valeur |
| --- | --- |
| `METERED_DOMAIN` | Le domaine complet, par exemple `monapp.metered.live` |
| `METERED_TURN_API_KEY` | La clé API de la credential TURN |

Ne publie jamais ces valeurs dans le dépôt GitHub.

## 3. Déployer la fonction Edge

Déployer la fonction `scc-turn-credentials` avec **Verify JWT activé**. Son code est dans `supabase/functions/scc-turn-credentials/index.ts`.

Elle vérifie la session Supabase, appelle Metered côté serveur et renvoie uniquement la liste des serveurs ICE au navigateur. La clé API Metered reste côté serveur.

## 4. Utiliser Screen Cast

1. Connecte-toi au dashboard SCC.
2. Ouvre SCC Studio puis Screen Cast.
3. Recharge la page après avoir ajouté les secrets.
4. Démarre le partage et autorise Chrome à capturer ton écran.
5. Ouvre la même URL de réception dans PRISM.

Le PC récupère la configuration TURN depuis la fonction Edge puis la transmet à la page de réception via le canal privé de la salle. Les identifiants TURN sont donc utilisés par les deux extrémités, sans être intégrés au code public du site.

## Notes

- SCC demande les serveurs de la région Europe.
- Les identifiants TURN doivent être créés à l'avance : Metered indique qu'une nouvelle credential peut prendre jusqu'à 2 minutes avant d'être utilisable.
- Le relais TURN consomme du trafic. Vérifie les limites et la consommation dans ton tableau de bord Metered.
- La vidéo reste transmise en direct entre les deux navigateurs via WebRTC ; Supabase Realtime ne transporte que la signalisation.
