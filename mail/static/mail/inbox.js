document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);
    
    document.querySelector('#compose-form').addEventListener('submit', send_email);
    
    // By default, load the inbox
    load_mailbox('inbox');
  });
  
  function compose_email() {
  
    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#emails-inbox-view').style.display = 'none';
    document.querySelector('#single-email-view').style.display = 'none';
  
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
    //event listener -> on click send_email
    
  }

  function send_email(event) {
    //preventDefault will stop the form from submitting immediately
    event.preventDefault();
    // get form data in vars
    const email_addressee = document.querySelector('#compose-recipients').value;
    const email_subject = document.querySelector('#compose-subject').value;
    const email_content = document.querySelector('#compose-body').value;
    // fetch post request to api
    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: email_addressee,
            subject: email_subject,
            body: email_content
          })

        })
        .then(response => response.json())
        .then(result => {
            load_mailbox('sent');
        });
  }

  function view_single_email(mailbox, email_id) {
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#single-email-view').style.display = 'block';
    document.querySelector('#single-email-view').innerHTML = ' ';

    //fetches a single email by id
    fetch(`/emails/${email_id}`)
        .then(response => response.json())
        .then(email => {
        
        console.log(email);

        if (email.read = 'false') {
            fetch(`/emails/${email_id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    read: true
                })
              })  
        };

        //appends a new div element containing email content

        const content = document.createElement('div');
        content.className = "list-group-item";
        content.innerHTML = `<div><p>From <strong>${email.sender}</strong> to <strong>${email.recipients}</strong></p></div> 
                             
                             <div class="list-group-item";";><b>Subject: </b>${email.subject}</div>
                             <div class="list-group-item">${email.body}</div>  
                             <div><br></div>
                             <div class="light">${email.timestamp}</div>
                             <div><br></div>
                             `;

        document.querySelector('#single-email-view').append(content);

        //gives user option to archive an email
        //redirects to inbox

        const archiver = document.createElement('button');
        archiver.id = "archiver";
        archiver.className = "btn btn-outline-secondary";
        archiver.classList.add('butt');
        
        if (!email.archived) {
            archiver.innerHTML = "Archive"
        } else {
            archiver.innerHTML = "Unarchive"
        }

        content.append(archiver);
        
        archiver.addEventListener('click', () => {
            fetch(`/emails/${email.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: !email.archived
                }) 
              }) 

        load_mailbox('inbox');
        }); 

        //give user option to reply to an email
        //brings the compose email view with prefilled fields
        
        if (mailbox === 'inbox') {
            const reply = document.createElement('button');
        
            reply.id = "reply"; reply.innerHTML = 'Reply';
            reply.className = "btn btn-outline-info";
            reply.classList.add("butt");
                content.append(reply);
            
            reply.addEventListener('click', () => {
                document.querySelector('#emails-view').style.display = 'none';
                document.querySelector('#compose-view').style.display = 'block';
                document.querySelector('#single-email-view').style.display = 'none';
                document.querySelector('#compose-recipients').value = email.sender;
                
                if (email.subject.slice(0,4) != "re: ") {
                    document.querySelector('#compose-subject').value = "re: " + email.subject;
                } else {
                    document.querySelector('#compose-subject').value = email.subject;
                };

                document.querySelector('#compose-body').value = 
                `On ${email.timestamp} ${email.sender} wrote: ${email.body}` 
                })
        };
            
        if (mailbox === 'inbox') {
            const mark_unread = document.createElement('button');
            mark_unread.id = "mark_unread"; mark_unread.innerHTML = "Mark as Unread";
            mark_unread.className = "btn btn-outline-secondary";
            mark_unread.classList.add("butt2");
            content.append(mark_unread)
            mark_unread.addEventListener('click', function() {
                reader(`${email.id}`);
            });
            }; 
        });
  }

  function reader(id) {
        fetch(`/emails/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                read: id.read = false
            }) 
          }) 

    load_mailbox('inbox');
  }

  function load_mailbox(mailbox) {
    //Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#single-email-view').style.display = 'none';

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    //fetches emails an appends each as a div element
    fetch(`/emails/${mailbox}`)
        .then(response => response.json())
        .then(emails => {
            emails.forEach(single_email => {
                const email_element = document.createElement('div');
                email_element.className = "list-group-item";
               
            
                //inner HTML of div contains email info
                if (mailbox === 'sent') {
                    console.log(mailbox);
                    email_element.innerHTML += `<div class="grid-container">
                    <div class="grid-item-sender"><b>To: </b>${single_email.recipients}</div> 
                    <div class="grid-item"><b>${single_email.subject}</b></div>
                    <div class="grid-item"></div>  
                    <div class="grid-item-date">${single_email.timestamp}</div>`
                } else { 
                    email_element.innerHTML += `<div class="grid-container">
                                                <div class="grid-item-sender"><b>From: ${single_email.sender}</b></div> 
                                                <div class="grid-item"><b>${single_email.subject}</b></div>
                                                <div class="grid-item"></div>  
                                                <div class="grid-item-date">${single_email.timestamp}</div>`
                }
                                                            
                //each email when clicked will open email                     
                email_element.addEventListener('click', function() {
                    view_single_email(mailbox, `${single_email.id}`);
                })

                //each email has a card container
                email_element.className = "list-group-item";

                //further styling depends on if viewed
                if (single_email.read) {
                    email_element.className = 'read';
                } else {
                    email_element.className = 'unread';
                }
                
                //appends email divs within #emails-view
                document.querySelector('#emails-view').append(email_element);
                const divider = document.createElement('div');
                divider.innerHTML = "<br>"
                document.querySelector('#emails-view').append(divider);

                });
            });
  }

