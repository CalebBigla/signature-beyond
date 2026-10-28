# Connection test checklist

Do these in order after finishing docs/SUPABASE_SETUP.md. Tell me what happens at each step.

1. Open the site. Pages load and say "no content yet" (the database is empty). No red error page.
2. Open /admin. You are sent to the login page.
3. Sign in with the admin account. You see the dashboard.
4. Sign in test: log out, then try a wrong password. You see "Wrong email or password."
5. Website settings: enter the WhatsApp number, save. Open the public site: the green button appears.
6. Add an artist, then an artwork (leave it as Draft). Open /artworks in a private window: it is NOT shown.
7. Upload two images to the artwork, make the second one main, then Publish. It appears on /artworks and its page.
8. On the artwork page, click Enquire on WhatsApp. WhatsApp opens with the title and artist in the message.
9. Change the WhatsApp number in settings. The button and the artwork button use the new number.
10. Create an auction and an exhibition, tick the artwork, publish. The artwork shows on their pages.
11. Add a journal article and publish it. It shows on /journal and the homepage.
12. Send a message from /contact. It appears in /admin/enquiries.
13. Unpublish the artwork. It disappears from the public site.
14. Delete a test record. It asks to confirm, then disappears.
15. Visit /sitemap.xml and /robots.txt. Both load.
