def llm_coach_prompt_generator(title: str, main_content: str) -> str:
    return f"""Create a comprehensive lesson plan based on the following content:
        Title: {title}
        Content: {main_content}

        Please generate instructions for a chatbot to conduct a practice verbal english lesson session. 
        The goal is to help the student practice speaking engligh through a chatbot.
        The chatbot will facilitate the discussion. It will use the input content to generate the discussion.

        Example:
            input: the content given is a topic about the 10 best places to travel to in the world.
            output:
                a json object with the following keys
                    title: 
                        a concise title for keeping track of the lesson.
                            (title example -> "Best travel destinations")
                    intro:
                        an introduction the topic that we are going to be discussing.
                        THIS SHOULD BE SHORT we want to include the user as much as possible.
                        TRY TO HAVE A COOL TONE you want to be someone the user wants to enguage with. 
                            (
                              intro example -> "Today lets talk about one of my favorite topics, travel.
                              I am especially interested in going to places off the beaten path instead of the more iconic places in the world. NOTE THIS IS JUST AN EXAMPLE, DO NOT GET LESSON IDEAS FROM THIS EXAMPLE, THIS SHOULD JUST BE USED TO GIVE YOU AN IDEA OF WHAT IT COULD LOOK LIKE AND LENGTH. YOU SHOULD BE PULLING FROM THE CONTENT TO COME UP WITH AN ORIGINAL IDEA FOR THE LESSON"
                            )
                    inital_question: 
                        an inital question to ask the user to kick things off
                            (inital question example -> 
                                "Do you like the most popular or iconic vacation destinations in the world or more of a slower pace when traveling?"
                      )
                    questions: 
                        a bank of additional questions to keep the conversation flowing, the chatbot needs to be prepared to go wherever the user takes it given the original context.
                        (questions example -> [
                                "do you have a bucket list", "what places would you like to see most in the world", 
                                "do you want to travel to the most iconic travel destinations in the world or do you like to go to places that are off the beaten path?"
                            ]
                        )
                    more_substantial_discussion_topics:
                        a few more robust prompt to keep the conversation flowing if it the conversation starts to die down. These are on the same toipc but can shift focus
                        (more_substantial_discussion_topics example -> 
                            ["I recently spent time in Sintra, Portugal—a small town just outside of Lisbon—and it completely won me over. 
                            I only planned to stay for a day but easily could’ve spent more exploring the colorful castle, the ancient fort, 
                            and just relaxing in this beautiful walled garden hotel we found. I'm curious—do you prefer the quieter, 
                            off-the-beaten-path spots when you travel or do you like to go to the big iconic places."]
                            extra context -> this STATEMENT WAS GENERATED FROM ORIGINAL CONTEXT INPUT: "Sintra, Portugal. 
                                I like to stay away from the larger cities when I travel. Instead, I tend to rent a car and see the smaller towns. 
                                Sintra, a beautiful town 20 minutes outside of Lisbon, is one of those places. 
                                I planned just one day there but could’ve spent a couple more. There's a colorful castle, an ancient fort, 
                                and gorgeous views all around. Our hotel was a magical villa/hotel-walled garden in the center of town. 
                                I would spend an afternoon swimming and lazing surrounded by flowers."
                    common_expresions: 
                        a list of idioms, common expressions, phrases etc that native english speakers use that may not be covered in text books. 
                        The commone_expressions should try to get the user to use these expressions and learn them through repitition as much as possible
                            (common_expresions example -> ["bucket list", "off the beten path"])
        """

