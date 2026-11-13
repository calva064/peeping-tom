

// Load in the data
Promise.all([
    d3.json("recommended_topics.json"),
    d3.json("advertisers.json"),
    d3.json("last_known_location.json"),
    d3.json("profile_searches.json"),
    d3.json("following.json"),
    d3.json("post_comments_clean.json"),
    d3.json("followers_1.json"),
    d3.json("stories.json")
]).then(ready);

//create color array for right-hand side
const colorList = ["#87b9c8", "#699954", "#c385be", "#4bc5ac", "#c9a53e"];

//create array to store text
let tooltipTextArray = [];


// Function to update the tooltip text
function updateTooltipText(newText, isLeft) {
	// Get random color for the new line of text
    const randomColor = getRandomColorFromList(isLeft);
    
    // Add the new text and its color to the array
    //unshift rather than push makes the text move
    tooltipTextArray.push({ text: newText, color: randomColor });

    // Display all text in the tooltip, each with its own color (preserved)
    tooltip.html(tooltipTextArray.map(entry => {
        return `<span style="color: ${entry.color}">${entry.text}</span>`; // Apply the stored color
    }).join("<br>")); // Join the text with line breaks

}


//get random color from color array
function getRandomColorFromList(isLeft) {
    let color;
    if (isLeft == "left" ){
        color = "black"
    }
    else{
        color = colorList[Math.floor(Math.random() * colorList.length)];
    }
	return color
}


function ready(data) {
    const recsData = data[0] // Extract the loaded JSON
    const advertisersData = data[1]
    const locData = data[2]
    const profileSearchData = data[3]
    const following = data[4]
    const post_comments = data[5]
    const followers = data[6]
    const stories = data[7]

// Extract data --------------------------------------------------------------------------------
 
    // Extract all "value" strings from the recsData JSON
    const values = recsData.topics_your_topics.map(
        topic => topic.string_map_data?.Name?.value
    ).filter(value => value); // Filter out undefined values

    // Extract all "advertiser_name" strings from the commentsData JSON
    const values2 = advertisersData.ig_custom_audiences_all_types.map(
    advertiser => advertiser.advertiser_name
).filter(advertiser_name => advertiser_name);

    // Extract all "value" strings from the location data
	 const values3 = locData.account_history_imprecise_last_known_location
    .map(entry => ({
        latitude: entry.string_map_data["Precise Latitude"]?.value,
        longitude: entry.string_map_data["Precise Longitude"]?.value
    }))
    .filter(location => location.latitude && location.longitude);


  // Extract all "value" strings from the profileSearchData JSON
    const values4 = profileSearchData.searches_user.map(
    user => user.string_map_data?.Search?.value
).filter(user => user);


   // Extract all "value" strings from the following JSON
    const values5 = following.relationships_following.map(
        following => following.string_list_data?.[0]?.value
    ).filter(following => following); // Filter out undefined values


       // Extract all "value" strings from the post_cpmments JSON
    const values6 = post_comments
    .map(comments => ({
    		comment: comments.string_map_data?.Comment?.value,
      	user: comments.string_map_data?.["Media Owner"]?.value
      }))
    .filter(comments => comments.comment && comments.user); // Filter out undefined values

       // Extract all "value" strings from the following JSON
    const values7 = followers.map(
        following => following.string_list_data?.[0]?.value
    ).filter(following => following); // Filter out undefined values


    // Extract all "value" strings from the stories JSON
    const values8 = stories.ig_stories?.map(
        story => story.media_metadata?.photo_metadata?.exif_data?.[0]
    ).filter(story => story); // Filter out undefined values

// ----------------------------------------------------------------------

    d3.selectAll('g') // Assuming <g> tags exist in your SVG
        .on('mouseover', function (event, d) {
            const partId = this.id; // Get the id of the hovered body part

              // Determine if the body part has "left" in its name
            const isLeftPart = partId.includes("left");


            if (isLeftPart) { // If the body part contains "left"
                tooltip
                    .style("left", "2vw") // Position near the left edge of the screen
                    .style("font-family", "Open Sans, sans-serif")
                    // .style("background-color", "#ffffff") // Set the background color

            } else if (partId.includes("right")) { // If the body part contains "right"
                tooltip
                    .style("left", "52vw") // Position near the right edge of the screen
                    .style("font-family", "Fira Code, monospace")
                    // .style("background-color", "#1f1f1f")


            } else { // For parts that don't contain "left" or "right"
                tooltip
                    .style("left", "30vw")
                    .style("top", "23vw")
                    .style("text-align", "center")
                    .style("font-family", "Fira Code, monospace")
                    // .style("background-color", "#e6e6e6") // Set the background color
                    .style("z-index", "1000");
            }

// update tooltip text -------------------------------------------------------------


            // display recommended topics data
            if (partId === "top_right") {
                // Pick a random string from the `values` array
                const randomValue = values[Math.floor(Math.random() * values.length)];
                const text = "Based on your Instagram activity, I'll recommend " + randomValue + " content to you in different areas of Instagram, such as Reels, Feed Recommendations, and Shopping.";
                updateTooltipText(text, "right"); // Update the tooltip text array

                d3.select(this)
                    .transition()
                    .attr("opacity", "0.3");
            }
            // display comments data
            else if (partId === "leg_right") {
                // Pick a random string from the `values` array
                const randomValue = values2[Math.floor(Math.random() * values2.length)];
                const text = "FYI: An advertiser named " + randomValue + " is using your activity or information.";
                updateTooltipText(text, "right"); // Update the tooltip text array
                d3.select(this)
                    .transition()
                    .attr("opacity", "0.3");
            }

             // display last known location data
	        else if (partId === "foot_right") {
	    		const formattedValues = values3
	        .map(location => `(${location.latitude}, ${location.longitude})`)
	        .join(", "); // Combine all locations into a single string
	        		const text = "Your precise last known location was " + formattedValues + ". Thanks for this information! I'll make sure to display relevant ads based on your location.";
               updateTooltipText(text, "right"); // Update the tooltip text array

			    d3.select(this)
			        .transition()
			        .attr("opacity", "0.3");
				}

				//display profile searches data
				 else if (partId === "arm_right") {
                // Pick a random string from the `values` array
                const randomValue = values4[Math.floor(Math.random() * values4.length)];
                const text = "You recently stalked " + randomValue + "'s profile, but I promise I won't tell them!";
                updateTooltipText(text, "right"); // Update the tooltip text array


                d3.select(this)
                    .transition()
                    .attr("opacity", "0.3");

            }
            //display stories data
				 else if (partId === "arm_left") {
                // Pick a random string from the `values` array
                const randomValue = values5[Math.floor(Math.random() * values5.length)];
                const text = "You're following " + randomValue + " on Instagram.";
                updateTooltipText(text, "left"); // Update the tooltip text array


                d3.select(this)
                    .transition()
                    .attr("opacity", "0.3");

            }

             // display last known location data
	        else if (partId === "leg_left") {
    			const randomComment = values6[Math.floor(Math.random() * values6.length)];
    			const text = `You said to ${randomComment.user}: ${randomComment.comment}`;
            updateTooltipText(text, "left"); // Update the tooltip text array

			    d3.select(this)
			        .transition()
			        .attr("opacity", "0.3");
				}

            //display followers data
                 else if (partId === "top_left") {
                // Pick a random string from the `values` array
                const randomValue = values7[Math.floor(Math.random() * values7.length)];
                const text = randomValue + " is following you on Instagram.";
                updateTooltipText(text, "left"); // Update the tooltip text array


                d3.select(this)
                    .transition()
                    .attr("opacity", "0.3");

            }

            else if (partId === "foot_left") {
                const imageUrl = "profile.jpg";

              // Clear previous tooltip content and add the image
                tooltip.html(`<img src="${imageUrl}" style="max-width: 200px; max-height: 200px;"><p>I have your profile photo.</p>`);


                // Make the tooltip visible and style it
                tooltip.style("visibility", "visible");

                d3.select(this)
                    .transition()
                    .attr("opacity", "0.3");
            }


           else if (partId === "eye_left") {
            const mediaFolder = "stories/"; const mediaFiles = ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.mp4", "9.jpg", "10.jpg", "11.jpg", "12.jpg", "13.jpg", "14.mp4", "15.jpg", "16.mp4", "17.mp4", "18.mp4", "19.mp4", "20.jpg", "21.mp4", "22.mp4"];
            const randomMedia = mediaFiles[Math.floor(Math.random() * mediaFiles.length)];
            tooltip.html(randomMedia.endsWith(".mp4")
              ? `<video src="${mediaFolder + randomMedia}" autoplay muted loop playsinline style="max-width: 250px; max-height: 500px; border: 1px solid #ccc; border-radius: 5px;"></video><p>Here's a story you posted!</p>`
              : `<img src="${mediaFolder + randomMedia}" style="max-width: 400px; max-height: 500px; border: 1px solid #ccc; border-radius: 5px;"><p>Here's a story you posted!</p>`);
            tooltip.style("visibility", "visible");

            d3.select(this)
                .transition()
                .attr("opacity", "0.3");
            }


        else if (partId === "eye_right") {
            // Select a random key from the values8 object (assuming it's structured correctly)
            const keys = Object.keys(values8).filter(k => values8[k]);  // Get the keys of the values8 object
            const randomKey = keys[Math.floor(Math.random() * keys.length)];  // Randomly select a key
            const exifData = values8[randomKey];  // Access the EXIF data object

            // Format the EXIF data as text to display in the tooltip
            let text = `
                I have lots of information on a story you posted: <br>
                Aperture: ${exifData.aperture} <br>
                Camera Position: ${exifData.camera_position} <br>
                Date Time Digitized: ${exifData.date_time_digitized} <br>
                ISO: ${exifData.iso} <br>
                Lens Model: ${exifData.lens_model} <br>
                Shutter Speed: ${exifData.shutter_speed} <br>
                Software: ${exifData.software}
            `;

            // Update the tooltip text with the extracted EXIF data
            updateTooltipText(text, "right");

            // Apply the transition effect to the element
            d3.select(this)
                .transition()
                .attr("opacity", "0.3");
        }


      else if (partId === "lips") {
        const text = "Peeping Tom vs. Peeping Tara <br> <br>This project aims to visualize the contrast between publicly accessible and platform-held personal data on Instagram. All data presented was collected by Instagram in the past three months (Sept, Oct, Nov 2024) and is sourced from Ariel Calver’s Instagram data archive. This data includes: advertisers collecting Ariel's information, her followers, people she is following, her last known location, her comments on posts, her recent profile searches, stories she's posted and their relevant metadata, and topics recommended to her by Instagram based on her activity.<br><br>Hovering over body parts on the left side of the screen will display the data we might expect Instagram to store about her, while hovering over body parts on the right side reveals the data that we may not realize the platform is collecting. By comparing these two perspectives, the project highlights the disparity between human expectations and the machine’s data collection practices."
    // Clear previous tooltip content and add the text
        updateTooltipText(text, "center");

    // Optionally, apply a transition effect to the lips element
        d3.select(this)
            .transition()
            .attr("opacity", "0.3");




    }


// ----------------------------------------------------------------------------------



        })
        .on('mouseout', function () { 

            d3.select(this)
                .transition()
                .attr("opacity", "1");
        });
}

// // Tooltip setup
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("visibility", "visible") // Start hidden
    .style("max-height", "100vh") // Tooltip won't grow beyond the viewport height
    .style("overflow-y", "auto") // Enable vertical scrolling when content overflows
    .style("position", "fixed")
    .style("font-size", "20px")
    .text("");

