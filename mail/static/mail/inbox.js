document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // CUSTOM sends email
  document.querySelector("#compose-form").addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function send_email(event) {
  let recipients = document.querySelector("#compose-recipients").value
  let subject = document.querySelector("#compose-subject").value
  let body = document.querySelector("#compose-body").value

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      "recipients": recipients,
      "subject": subject,
      "body": body,
    })
  })

    .then((response) => response.json())

    .then((result) => {

      // Transition view to sent to show the email being sent
      load_mailbox('sent');

    });
  event.preventDefault();
}


function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      // Print emails
      console.log(emails);

      emails.forEach(email => {
        // Displaying the information recieved
        const emailEntries = document.createElement("div");

        if (email.read) {
          emailEntries.innerHTML = `<div id="email_div_${email.id}" class="row" style="border: 1px solid #3f3e3e;border-radius: 7px; background: #a0a0a0; padding: 10px 5px 10px 5px; margin: 10px 0 10px 0;"><strong class="col-auto">${email.sender}</strong> <div class="col-auto">${email.subject}</div> <div class="col-auto ml-auto text-muted">${email.timestamp}</div></div>`;
        }
        else {
          emailEntries.innerHTML = `<div id="email_div_${email.id}" class="row" style="border: 1px solid #999b9b;border-radius: 7px; background: white; padding: 10px 5px 10px 5px; margin: 10px 0 10px 0;"><strong class="col-auto">${email.sender}</strong> <div class="col-auto">${email.subject}</div> <div class="col-auto ml-auto text-muted">${email.timestamp}</div></div>`;
        }

        document.querySelector("#emails-view").append(emailEntries);
        document.querySelector(`#email_div_${email.id}`).addEventListener('click', () => {
          fetch(`/emails/${email.id}`) // Data is captured here for clicked element
            .then(response => response.json())
            .then(email => {

              fetch(`/emails/${email.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                  read: true
                })
              });

              let email_view_page = document.querySelector("#emails-view")


              // HTML for email view
              email_view_page.innerHTML = `<br><div><strong>From:</strong> ${email.sender}</div>`;
              email_view_page.innerHTML += `<div><strong  style="padding-right: 22px;">To:</strong> ${email.recipients}</div>`;
              email_view_page.innerHTML += `<br><div><strong>Subject:</strong> ${email.subject}</div>`;
              email_view_page.innerHTML += `<div style="justify-content: end;"><strong>Timestamp:</strong> ${email.timestamp}</div>`;

              // Archived verification
              if (!email.archived) {
                email_view_page.innerHTML += `<br><button class="btn btn-sm btn-outline-primary" id="archive">Archive</button>`;
              } else {
                email_view_page.innerHTML += `<br><button class="btn btn-sm btn-outline-primary" id="archive">Unarchive</button>`;
              }

              email_view_page.innerHTML += `<button class="btn btn-sm btn-outline-primary ml-1" id="reply">Reply</button>`;

              email_view_page.innerHTML += "<hr>"
              email_view_page.innerHTML += `<br><div><p>${email.body}</p></div>`;

              document.querySelector('#archive').addEventListener('click', () => {
                archive_button(email.id, email.archived);

              });
              document.querySelector("#reply").addEventListener('click', () => {
                reply_button(email.sender, email.timestamp, email.subject, email.body);
              });
            })

            // Catch errors so they can be seen and accessed in the log
            .catch(error => {
              console.log('Error:', error);
            });
        })
      });
    })
    .catch(error => {
      console.log('Error:', error);
    });
}

function archive_button(email_id, archive_boolean) {
  if (!archive_boolean) {
    fetch(`/emails/${email_id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: true
      })
    })
      .then(() => {
        load_mailbox('inbox');
      })
      .catch(error => {
        console.log('Error:', error);
      });
  } else {
    fetch(`/emails/${email_id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: false
      })
    })
      .then(() => {
        load_mailbox('inbox');
      })
      .catch(error => {
        console.log('Error:', error);
      });
  }
}

function reply_button(sender, timestamp, subject, body) {
  // Option 2: Use already made 'composeEmail' function but change fields slightly

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // fill coposition fields
  document.querySelector('#compose-recipients').value = sender;
  document.querySelector('#compose-body').value = `\n\n----\nOn ${timestamp} ${sender} wrote: \n`;
  document.querySelector('#compose-body').value += `\n"${body}"\n----`;

  // Checking for "RE: " in the subject
  if (subject.startsWith("RE: ")) {
    document.querySelector('#compose-subject').value = subject;
  } else {
    document.querySelector('#compose-subject').value = "RE: " + subject;
  }

}