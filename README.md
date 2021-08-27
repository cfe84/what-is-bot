Provides definitions for initialisms, acronyms, and weird words that people dangle around in the company. Deploy the bot in Teams and @whatis it to understand what they're talking about!

# Todo

Basic:
- [x] If no definition found, ask for one.
- [x] Edit definitions
- [x] List existing definitions
- [ ] Privacy policy and terms and conditions
- [x] Support multi-tenant, filter based on tenantid
- [ ] Delete definition
- [ ] Support multiple dictionaries by tenant
- [ ] Support SSO

Advanced:
- [ ] Receive all messages and respond with @mention

# Run

- Run Ngrok `ngrok http -host-header=rewrite 3978`
- Update bot endpoint
- Zip appManifest and deploy
- Run `npm start`

