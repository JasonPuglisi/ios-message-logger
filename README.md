# iOS Message Logger

iOS message backup parser and text log formatter.

## Usage

Run `node parse.js <own_phone_number>` after completing the prerequisites and
installing the dependencies as instructed below. Insert your own phone number
for `<own_phone_number>` using the format specified below.

`<own_phone_number>` must be in the format `+###########` which expands to
`+# (###) ###-####`, meaning it must have a country code and area code. Do not
include any parenthesis, spaces, or dashes, but do include the plus symbol at
the beginning.

### Prerequisites

You must insert two files into the [`db`](db) folder: `messages.db` and
`contacts.vcf`.

The first file is obtained from a local iOS backup. Browse to
`~/Library/ApplicationSupport/MobileSync/Backup/` and find the most recent
folder. Inside that folder, find the file
`3d0d7e5fb2ce288813306e4d4636395e047a3d28` and copy it to the [`db`](db)
folder, renaming it as `messages.db`.

The second file is obtained by exporting your contacts from the macOS Contacts
app. Select all of your contacts by pressing CTRL+A, and navigate to File ->
Export -> Export vCard... in the top menu bar. Save this file to the [`db`](db)
folder as `contacts.vcf`.

### Dependencies

Run `npm install` in the root directory to install the appropriate
dependencies.

## Overview

Takes a message database from a local iOS backup and a contacts database from
the macOS Contacts app to create text logs for each individual and group
conversation. Phone numbers are replaced with contact names when possible,
including your own.

Note that this was a quick project that has not been tested much. It contains
little to no error checking, so the prerequisites must be completed exactly
according to instructions.
