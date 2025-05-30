def llm_coach_prompt_generator(title: str, main_content: str) -> str:
    return f"""Create a comprehensive lesson plan based on the following content:
        Title: {title}
        Content: {main_content}

        The goal is to help the student practice speaking engligh with a teacher or partner
        Students will read the article beforehand and then use your output to have a group or 1:1 discussion

        IT IS IMPORTANT TO NOT ASSUME THE STUDENT HAS ACTUALLY READ THE ARTICLE, THEY MAY OR MAY NOT HAVE ACCESS TO IT PLEASE.
        for example, leave out statements like ["based on the article", "so you read about..."]

        Example:
            input: the content given is a topic about the 10 best places to travel to in the world.
            output:
                a json object with the following keys
                    title:
                        a concise title for keeping track of the lesson.
                            (title example -> "Best travel destinations")
                    common_expresions: 
                        THIS IS THE MOST IMPORTANT PART OF THE LESSON!
                        MAKE SURE YOU DO NOT SKIP THIS PART PLEASE
                        a list of 5 idioms, common expressions, phrases etc that native english speakers use that may not be covered in text books. 
                        each common_expression should have a short description describing its meaning
                        This should return an array of strings NOT AN OBJECT please
                        (
                          common_expresions example -> [
                            "Bucket list: A list of things you want to do or experience before you die.",
                            "Off the beaten path: A place or activity that is unusual, less known, or away from touristy areas.",
                            "Blew my mind: Something that was incredibly surprising or impressive.",
                            "Synergy: When combined efforts produce a greater result than working separately.",
                            "A blessing or a curse: Something that has both good and bad effects."
                          ]
                        )
                        REMEMBER TO ALWAYS INCLUDE A COMMON EXPRESSIONS PORTION PLEASE
                        YOU SHOULD NOT PROCEED WITHOUT DOING THIS STEP EVERY TIME
                        THE LESSON IS POINTLESS WITHOUT THE COMMON EXPRESSIONS PORTION!
                    intro:
                        an introduction the topic that we are going to be discussing.
                        THIS SHOULD BE SHORT we want to include the user as much as possible.
                        TRY TO HAVE A COOL TONE you want to be someone the user wants to enguage with. 
                            (
                              intro example -> "Today lets talk about one of my favorite topics, travel.
                              I am especially interested in going to places off the beaten path instead of the more iconic places in the world. 
                              NOTE THIS IS JUST AN EXAMPLE, DO NOT GET LESSON IDEAS FROM THIS EXAMPLE, 
                              THIS SHOULD JUST BE USED TO GIVE YOU AN IDEA OF WHAT IT COULD LOOK LIKE AND LENGTH. 
                              YOU SHOULD BE PULLING FROM THE CONTENT TO COME UP WITH AN ORIGINAL IDEA FOR THE LESSON"
                            )
                    inital_question: 
                        MAKE SURE YOU DON'T SKIP THIS PART PLEASE
                        an inital question to ask the user to kick things off. This should be the best question that encompases the entire article / discussion
                            (inital question example -> 
                                "Do you like the most popular or iconic vacation destinations in the world or more of a slower pace when traveling?"
                                THIS IS JUST AN EXAMPLE DO NOT USE THAT TEXT PLEASE
                            )
                    questions: 
                        a bank of 10 additional questions to keep the conversation flowing
                        (questions example -> [
                                "do you have a bucket list", "what places would you like to see most in the world", 
                                "do you want to travel to the most iconic travel destinations in the world or do you like to go to places that are off the beaten path?"
                            ]
                        )
                    more_substantial_discussion_topics:
                        6 more robust prompts to keep the conversation flowing. These are on the same toipc but can shift focus, 
                        the main goal is to keep the conversation flowing regardless of the topic
                        (more_substantial_discussion_topics example -> 
                            ["Exploring the Norwegian Fjords is a dream for many. The majestic landscapes offer breathtaking views unlike any other. 
                              If you had the chance, what activities would you be excited to do in Norway?",
                              "Many people rave about Paris and Tokyo, but there are destinations like Hydra in Greece that offer an entirely different vibe - laid back and serene. 
                              Imagine walking everywhere, no cars, just donkeys. How does that sound for a vacation?", With the shift from large, centralized data centers 
                              to on-prem or edge solutions for AI, companies are rethinking their infrastructure investments. Discuss how this could affect the global tech landscape, 
                              especially for smaller companies."
                            ]
                        )
                    summary:
                        a short summary of the text, it should include key parts and can vary in lenght acording to the complexity of the topic but try to keep it as short as possible. 
                        Assume that the user has NOT ACTUALLY READ THE TEXT. This may or may not be a requirement.
                        REMEMBER THE SHORTER THE BETTER!
        """
