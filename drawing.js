

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

//create arrays to store text for each side
let tooltipTextArrays = { left: [], right: [] };

// Spacers that make the text wrap around the figure's real silhouette (head, arms, body) instead of leaving one wide margin
function spacersHTML(side, panelNode) {
    const mid = window.innerWidth / 2, gap = 14;
    const cs = getComputedStyle(panelNode);
    const contentTop = parseFloat(cs.paddingTop), edge = parseFloat(side === "left" ? cs.paddingRight : cs.paddingLeft);
    const r = id => { const el = document.getElementById(id); return el ? el.getBoundingClientRect() : null; };
    const reach = rect => rect ? Math.max(0, side === "left" ? mid - rect.left : rect.right - mid) : 0;
    const arm = r("arm_" + side);
    if (!arm) return "";
    const bodyRects = ["top_", "leg_", "foot_"].map(p => r(p + side)).filter(Boolean);
    const headRects = ["face", "hair"].map(r).filter(Boolean);
    const w = rect => Math.max(0, Math.max(...[].concat(rect).map(reach)) + gap - edge);
    const armTop = Math.max(0, arm.top - contentTop), armBottom = Math.max(armTop, arm.bottom - contentTop);
    const figBottom = Math.max(armBottom, Math.max(...bodyRects.map(x => x.bottom)) - contentTop);
    const bands = [
        [armTop, w(headRects)],
        [armBottom - armTop, w(arm)],
        [figBottom - armBottom, w(bodyRects)]
    ];
    const f = side === "left" ? "right" : "left";
    return bands.filter(b => b[0] > 0).map(b => `<div style="float:${f};clear:${f};width:${b[1]}px;height:${b[0]}px"></div>`).join("");
}

// Render one side, then drop the oldest lines only once the text would run past the bottom of the screen
function renderSide(side) {
    const arr = tooltipTextArrays[side];
    const panel = (side === "right") ? tooltipR : tooltipL;
    const node = panel.node();
    const render = () => panel.html(spacersHTML(side, node) + arr.map(entry => `<div style="color: ${entry.color}; margin-bottom: 0.8em;">${entry.text}</div>`).join(""));
    render();
    while (arr.length > 1 && node.scrollHeight > node.clientHeight) {
        arr.shift();
        render();
    }
}

// Function to update the tooltip text (left panel = what you'd expect, right panel = what the platform holds)
function updateTooltipText(newText, side) {
    side = (side === "right") ? "right" : "left"; // "left" and "center" go on the left panel
    tooltipTextArrays[side].push({ text: newText, color: getRandomColorFromList(side) });
    renderSide(side);
}


//get random color from color array
function getRandomColorFromList(isLeft) {
    let color;
    if (isLeft != "right"){
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


            // (tooltip positioning is now handled by the two fixed panels in CSS)

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
                updateTooltipText(`<img src="${imageUrl}" style="max-width: 200px; max-height: 200px;">`, "left");


                // Make the tooltip visible and style it

                d3.select(this)
                    .transition()
                    .attr("opacity", "0.3");
            }


           else if (partId === "eye_left") {
            const mediaFolder = "stories/"; const mediaFiles = ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.mp4", "9.jpg", "10.jpg", "11.jpg", "12.jpg", "13.jpg", "14.mp4", "15.jpg", "16.mp4", "17.mp4", "18.mp4", "19.mp4", "20.jpg", "21.mp4", "22.mp4"];
            const randomMedia = mediaFiles[Math.floor(Math.random() * mediaFiles.length)];
            updateTooltipText(randomMedia.endsWith(".mp4")
              ? `<video src="${mediaFolder + randomMedia}" autoplay muted loop playsinline style="max-width: 250px; max-height: 500px; border: 1px solid #ccc; border-radius: 5px;"></video><div>Here's a story you posted!</div>`
              : `<img src="${mediaFolder + randomMedia}" style="max-width: 400px; max-height: 500px; border: 1px solid #ccc; border-radius: 5px;"><div>Here's a story you posted!</div>`, "left");

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
        tooltipC.html(text).style("visibility", "visible");

    // Optionally, apply a transition effect to the lips element
        d3.select(this)
            .transition()
            .attr("opacity", "0.3");




    }


// ----------------------------------------------------------------------------------



        })
        .on('mouseout', function () { 
            if (this.id === "lips") tooltipC.style("visibility", "hidden"); // concept box only shows while hovering the mouth

            d3.select(this)
                .transition()
                .attr("opacity", "1");
        });
}

// Tooltip panels: left half (white) and right half (dark)
const tooltipL = d3.select("body").append("div").attr("class", "tooltip tooltip-left");
const tooltipR = d3.select("body").append("div").attr("class", "tooltip tooltip-right");
const tooltipC = d3.select("body").append("div").attr("class", "tooltip-center").style("visibility", "hidden");

// Re-fit when photos/videos finish loading (their height isn't known until then)
["left", "right"].forEach(side => {
    const node = (side === "right" ? tooltipR : tooltipL).node();
    node.addEventListener("load", () => renderSide(side), true);
    node.addEventListener("loadeddata", () => renderSide(side), true);
});

window.addEventListener("resize", () => { renderSide("left"); renderSide("right"); });
