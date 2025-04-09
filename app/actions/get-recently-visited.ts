"use server";

import { AuthFetchUserAttributesServer, AuthGetCurrentUserServer, cookiesClient } from "@/utils/amplify-utils";
import { createUserRecord } from "./create-user-record";


export async function getRecentlyVisited() {
    try {
        //console.log("IN NEWLY ADDED")

        const currentUser = await AuthGetCurrentUserServer();
        const userAttributes = await AuthFetchUserAttributesServer();
        if (!currentUser || !userAttributes) return false;
        const username = userAttributes.preferred_username
        if (!username) return false;

        //console.log(email)

        const userExists = await createUserRecord()
        if (userExists == false) return false;
        const client = cookiesClient;


        // Get all ids and datetime
        const userRes = await client.models.User.list({
            filter:
            {
                username: {eq: username}
            }
        });
        if(!userRes||!userRes.data||userRes.data.length==0)
        {
            return false;
        }
        const recentlyVisitedIds = userRes.data[0].recentlyVisited
        if(!recentlyVisitedIds){
            return false;
        }


        const bubbleResults = [];
        let i = 0;
        for (let i = 0; i < recentlyVisitedIds.length && i < 5; i++)
        {
            const recentBubble = await client.models.Bubble.get(
                {
                    id: recentlyVisitedIds[i]
                }
            );
            
            if (recentBubble?.data) {
                bubbleResults.push(recentBubble.data); // Store only the `data` part
            }
            
        }

        //const recentIDs = getRecentIDs(bubbleDatesAndIDs);
        //console.log("IN NEWLY ADDED 3", recentIDs)
        // Get id, title, author of the 5 ids
        //console.log("IN NEWLY ADDED 4", bubbleResults)
        console.log("hIIIIII WEWAA")
        
        //unsorted
        const simplifiedBubbleData = bubbleResults.map(
            ({ id, title, author, dateCreated, content, iconName }) => ({
                id, title, author, dateCreated, content, iconName
            })
        );
        console.log("THIS IS SIMPLIFIED BUBBLE DATA UNSORTED:", simplifiedBubbleData)
        // Resort by dateCreated
        //console.log("IN NEWLY ADDED 5")
        return { simplifiedBubbleData }

    } catch (error) {
        console.error("Error creating bubble:", error);

        return false;
    }
}
