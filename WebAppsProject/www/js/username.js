var db;  // database variable

db = new PouchDB("usernames"); // this creates the database



function addUsername() 
{
	var user_name=document.getElementById("user_name").value;

	if (user_name.toString().length <= 0) // This check to see if there is a username
	{																		   
		NoUsername();
		event.preventDefault();
	}

	else
	{
		var usernames = {
	    _id: new Date().toISOString(),
	    user__name: user_name
	  	};
	  
	  	db.put(usernames, function callback(err, result) 
		{
		    if (!err) 
			{
		    	console.log('Successfully saved a contact!');
			  	AddItemNotification();
		    }
		});
	}
}

function DisplayUsername() // This is prints the username 
{
	db.allDocs({include_docs: true}, function(err, docs) 
	{
		var num_records=docs.total_rows;
		var display_records="";

		if (err) 
		{
	    	return console.log(err);
	   	} 

		else 
		{
			display_records = display_records 
				+
				'<div class="WelcomeUser">' +
                   'Welcome, ' +
                   docs.rows[num_records-1].doc.user__name +
                '</div>';

		   	document.getElementById("username").innerHTML = display_records;
	   	}
	});
}



// Alerts

function NoUsername() // This is the alert when there is no username
{
	Swal.fire
    ({
	    title: 'Error!',
	    text: 'You need to enter a username!',
	    icon: 'warning',
	    confirmButtonText: '<span onclick="redirect()"> Will make one now! </span>'
    });
}

function redirect()
{
	window.location.href = "settings.html";
}

function AddItemNotification() // This is the alert when a username was successfully created
{
    Swal.fire
    ({
	    title: 'Success!',
	    text: 'Username was added!',
	    icon: 'success',
	    confirmButtonText: 'Yayyyy!'
    });
	event.preventDefault();
}