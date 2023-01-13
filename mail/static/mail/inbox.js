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
  console.log(recipients, subject, body)

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
      // Print Result
      console.log(result);
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
        // Get data from json given by email
        let sender = email.sender;
        let subject = email.subject;
        let timestamp = email.timestamp;
        let read = email.read;


        // Displaying the information recieved
        const emailEntries = document.createElement("div");
        if (read) {
          emailEntries.innerHTML = `<div style="border: 1px solid #3f3e3e;border-radius: 7px; background: gray; padding: 10px 5px 10px 5px; margin: 10px 0 10px 0;">Sender: ${sender} Subject: ${subject} timestamp: ${timestamp}</div>`;
        }
        else {
          emailEntries.innerHTML = `<div style="border: 1px solid #c0c1c1;border-radius: 7px; background: white; padding: 10px 5px 10px 5px; margin: 10px 0 10px 0;">Sender: ${sender} Subject: ${subject} timestamp: ${timestamp}</div>`;
        }
        document.querySelector("#emails-view").append(emailEntries);
      });
    });
}