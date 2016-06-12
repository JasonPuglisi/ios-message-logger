# iOS Message Logger

This utility takes a message database from a local iOS backup and a contacts
database from a Contacts.app export. It dumps all conversations to separate
text files, and replaces phone numbers with names from contacts when possible.

# Usage

`node parse.js <own_phone_number>`

<own_phone_number> must be in the format `+###########` which expands to
`+# (###) ###-####`, meaning it must have a country code and area code. Do not
include any parenthesis or spaces, but do include the plus symbol at the
beginning.

For the utility to work, you must have two files in the `db` folder:
`messages.db` and `contacts.vcf`. `messages.db` will come from
`~/Library/ApplicationSupport/MobileSync/Backup/RECENT_BACKUP_FOLDER/3d0d7e5fb2ce288813306e4d4636395e047a3d28`
and `contacts.vcf` will come from a vCard contacts export from Contacts.app.

To get the messages database, make sure you have a recent local backup of your
device from iTunes. For RECENT_BACKUP_FODLER, it's probably best to use the
newest folder available.

To get the contacts database, select all of your contacts in Contacts.app,
and use the menu at the top to export a vCard file.

# Notes

This code wasn't really written to be published, but I wanted to put it out
there in case anyone wants to base something off of it. For this reason though,
it's not very pretty. Right now, there's no error checking to make sure the
message and contact databases exist, or that a phone number was supplied on the
command line. These are easy fixes, but I don't feel like adding to the code
since I haven't touched it in a while. Just make sure everything is where it's
supposed to be and this should work pretty well!

