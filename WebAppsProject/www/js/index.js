/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready


var db;  // database variable

db = new PouchDB("DLS2ShoppingList"); // this creates the database



var Quan = 1;
  
function add() // this controls the + button which increases the quantity by 1
{
	Quan = Quan + 1;
	document.getElementById('quantity').innerHTML = Quan;
    event.preventDefault();
}
  
function sub() // this controls the - button which decreases the quantity by 1
{
	Quan = Quan - 1;
    if(Quan < 0)
    {
      Quan = 0;
      document.getElementById('quantity').innerHTML = Quan;
    }
    else
    {
      document.getElementById('quantity').innerHTML = Quan;
    }
    event.preventDefault();
}



function purchased() // This checks to see if the user selected if the item was purchased or not
{
	var purchased = document.getElementsByName('purchased');
	var purchased_value;
	for(var i = 0; i < purchased.length; i++)
	{
		if(purchased[i].checked)
		{
			purchased_value = purchased[i].value;			
		}	
	}

	return purchased_value;
}



function random(min, max, length) {    // This creates a random number between 1000000 and 9999999 but I dont think we need this
    var numbers = [];
    
    function _random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    Array.apply(null, new Array(length)).reduce(function(previous) {
        var nextRandom;
        
        if(previous === min) {
            nextRandom = _random(min + 1, max);
        } else if(previous === max) {
            nextRandom = _random(min, max - 1);
        } else {
            if(_random(0, 1)) {
                nextRandom = _random(previous + 1, max);                
            } else {
                nextRandom = _random(min, previous - 1);            
            }
        }
        
        numbers.push(nextRandom);
        return nextRandom;
    }, _random(min, max));
    
    return numbers;
}

ItemId = random(1000000,9999999);



function addItem() // This adds an item to the list
{
	var item_name=document.getElementById("ItemName").value;
	var item_price=document.getElementById("CostOfItem").value;
	var item_category=document.getElementById("CategoryOfItem").value;
	var quantity=document.getElementById("quantity").innerHTML;

	var ActualQuantity = parseInt(quantity);
	var ItemsCost = item_price;
	var TotalCost = ActualQuantity * ItemsCost;

    const formatter = new Intl.NumberFormat  // This is what converts the number to a currency $
    ('en-US', {								 // It does puts it in this format $0.00
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
    });
    
    var newTotal = formatter.format(TotalCost);
    var newPrice = formatter.format(ItemsCost);

	var paid = purchased();
	var purchasedOrNot = parseInt(paid);
	  
	var item = {							// This is the item variable 
	_id: new Date().toISOString(),
	id: ItemId,
	name: item_name,
	PriceWithoutCurrency: ItemsCost,
	price: newPrice,
	category: item_category,
	item_quantity: ActualQuantity,
	purchased: purchasedOrNot,
	totalCost: newTotal
	};


	if (item_name.toString().length <= 0 || item_price.toString().length <= 0) // This checks to see if the user entered the item name
	{																		   // or item price if they didn't an error message will be displayed
		const error = document.getElementsByClassName("AddItemBtn");
		error.addEventListener("click", EmptyForm());
		alert("nothing entered");
	}
	else 
	{
		db.put(item, function callback(err, result) 
		{
			if (!err) 
			{
		      console.log('Successfully saved a item!');
		    }

		    const btn = document.getElementsByClassName("AddItemBtn");
			btn.addEventListener("click", AddItemNotification());

		});
		event.preventDefault();	
	}	
}



function RemoveAllItems() // This removes all the items from the list
{
	Swal.fire
	({
	  title: 'Are you sure?',
	  text: "You won't be able to revert this!",
	  icon: 'warning',
	  showCancelButton: true,
	  confirmButtonColor: '#ffbbec',
	  cancelButtonColor: '#d33',
	  confirmButtonText: 'Delete ALL ITEMS!'
	})
	.then((result) => 
	{
		if (result.isConfirmed) 
		{
		    Swal.fire
		    (
		      'Deleted!',
		      'All items have been deleted!',
		      'success'
		    );

		    db.allDocs({include_docs: true}).then(allDocs => 
			{
		  		return allDocs.rows.map(row => 
		  		{
		    		return {_id: row.id, _rev: row.doc._rev, _deleted: true};
		  		});
			})
			.then(deleteDocs => 
			{
		  		return db.bulkDocs(deleteDocs);
			});
		}
	});

	event.preventDefault();	
}



function Calculate() // This gets the sum of 1 of each item on the list
{
	db.allDocs({include_docs: true}, function(err, docs) 
	{
		if (err) 
		{
	    	return console.log(err);
	   	} 

		else 
		{
	    	var num_records=docs.total_rows;
		  	var display_records = 0.0;
		  	var ItemName = "";

		  	for(var i = 0; i < num_records; i++)
			{
				display_records =  display_records + parseFloat(docs.rows[i].doc.PriceWithoutCurrency);
				ItemName = ItemName + '<div id="ItemsOnList">' + docs.rows[i].doc.name + '</div>';
		   	}

		   	const formatter = new Intl.NumberFormat
		    ('en-US', {
		    style: 'currency',
		    currency: 'USD',
		    minimumFractionDigits: 2
		    });
		    
		    var newTotal = formatter.format(display_records);

		   	document.getElementById("totalCostOfEachItem").innerHTML = newTotal;
		   	document.getElementById("ItemsOnList").innerHTML = ItemName;
	   }
	});

	event.preventDefault();
}



function DisplayItems() // This displays all the items and their info on the view items page
{
	db.allDocs({include_docs: true}, function(err, docs) 
	{
		var num_records=docs.total_rows;
		var display_records="";

		var categories = "";
		var CategoryArray = [];

		for(var i = 0; i < num_records; i++) // This makes an array of the categories
		{
			CategoryArray[i] = docs.rows[i].doc.category;
		}

		const NewArray = (array) =>  		// This gets the unique values in the array
		(
			[... new Set (array)]
		);

		var noodles = NewArray(CategoryArray); // This is the array's variable sorry about the name

		console.log(noodles);

		noodles.forEach(function(entry) // This displays the unique category values in the dropdown box
		{
			categories += '<option id="itemByCategory"> ' + entry + '  </option>';
		});

		let SortByCategoryList = document.getElementById("SortByCategory"); // This and the next 5 lines of code
		var CategorySelection = "";									// I tried to check to see if a certain category was selected

		SortByCategoryList.addEventListener('change', () => 
		{
			CategorySelection = SortByCategoryList.options[SortByCategoryList.selectedIndex].value;

			if(CategorySelection = SortByCategoryList.options[SortByCategoryList.selectedIndex].value === noodles)
			{
			   	console.log(CategorySelection);
			}
		});



		if (err) 
		{
	    	return console.log(err);
	   	} 

		else 
		{
		  	for(var i = 0; i < num_records; i++) // This is responsible to print all the items on the list 
			{
				display_records=display_records 	
				+

				'<div class="item">' + 
					'<div class="itemInfo">' +

					'<div class="itemName">' + 
					docs.rows[i].doc.name +
					'</div>' +

					'<div class="itemPrice">' +
					'Price: ' + docs.rows[i].doc.price + ' each' +
					'</div>' +

					'<div class="itemPrice">' +
					'Quantity: ' + docs.rows[i].doc.item_quantity + 
					'</div>' +

					'<div class="itemPrice">' +
					'Category: ' + docs.rows[i].doc.category +
					'</div>' +

					' <div class="itemsTotalCost">' +
					docs.rows[i].doc.totalCost+ 
				'</div> </div> </div>' + '<br>';
		   	}

		   	document.getElementById("itemsListContainer").innerHTML = display_records;
		   	document.getElementById("SortByCategory").innerHTML = categories;
	   		
	   		let selection = document.getElementById("SortByPurchased"); // This was to sort the items by if they were purchased or not
	   		var resultOfSelection = "";									// But it still needs work

	   		selection.addEventListener('change', () => 
	   		{
	   			resultOfSelection = selection.options[selection.selectedIndex].value;

	   			if(resultOfSelection = selection.options[selection.selectedIndex].value === "all")
	   			{
	   				console.log("boop boop boop");
	   			}

	   			else if(resultOfSelection = selection.options[selection.selectedIndex].value === "purchasedItemsOnly")
	   			{
				  	PurchasedItems();   				
	   			}

	   			else if(resultOfSelection = selection.options[selection.selectedIndex].value === "NotPurchasedItemsOnly")
	   			{
	   				ItemsNotPurchased();
	   			}
	   		});
	   	}
	});

}


// I feel as tho the next 2 functions could have been function

function PurchasedItems() // This was to check to see if the items were purchased or not
{
	db.allDocs({include_docs: true}, function(err, docs) 
	{
		if (err) 
		{
			return console.log(err);
		} 
		else 
		{
			var num_records=docs.total_rows;
			var display_records="";

			for(var i = 0; i < num_records; i++)
			{
				if(docs.rows[i].doc.purchased.value = 1)
				{
					console.log("Items were purchased!");
				}
			}			   
		}
	});
}



function ItemsNotPurchased() // This was to check to see if the items were purchased or not
{
	db.allDocs({include_docs: true}, function(err, docs) 
	{
		if (err) 
		{
			return console.log(err);
		} 
		else 
		{
			var num_records=docs.total_rows;
			var display_records="";

			for(var i = 0; i < num_records; i++)
			{
				if(docs.rows[i].doc.purchased.value = 0)
				{
					console.log("Items were not purchased!");
				}
			}			   
		}
	});
}



function AddItemNotification() // This is the alert when an item was successfully added to the list
{
    Swal.fire
    ({
	    title: 'Success!',
	    text: 'Item was added!',
	    icon: 'success',
	    confirmButtonText: 'Cool'
    });
	event.preventDefault();
}

function EmptyForm() // This is the alert when the user tries to add an item to a list with missing info or the try to sumbit an empty form
{
	Swal.fire
    ({
	    title: 'Error!',
	    text: 'Item details are missing!',
	    icon: 'warning',
	    confirmButtonText: 'Will add them now'
    });
	event.preventDefault();
}


function RemoveAll() // This is the alert when the user tries to remove all of the items from the list
{
	Swal.fire
	({
	  title: 'Are you sure?',
	  text: "You won't be able to revert this!",
	  icon: 'warning',
	  showCancelButton: true,
	  confirmButtonColor: '#3085d6',
	  cancelButtonColor: '#d33',
	  confirmButtonText: 'Yes, delete it!'
	}).then((result) => {
	  if (result.isConfirmed) {
	    Swal.fire(
	      'Deleted!',
	      'All items have been deleted!',
	      'success'
	    )
	  }
	})
	event.preventDefault();
}





function darkMode() // This is the dark mode setting but it still needs some work
{ 					// If you add this to a button it will change the background to a darker gradient
					// However it doesn't stay for some reason gotta work on that
	var container = document.getElementById("containter");
	container.style.background = "linear-gradient( 194.3deg,  rgba(26,33,64,1) 10.9%, rgba(81,84,115,1) 87.1% )";
}
