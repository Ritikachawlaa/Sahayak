import os
import pandas as pd
import re

# (Learning resources cache remains the same)
learning_resources_cache = {
    'React': { 'websites': ['https://react.dev/learn'], 'youtube': 'https://www.youtube.com/watch?v=bMknfKXIFA8' },
    'Python': { 'websites': ['https://www.python.org/about/gettingstarted/'], 'youtube': 'https://www.youtube.com/watch?v=K5KVEU3aaeQ' },
    'Data Analysis': { 'websites': ['https://www.geeksforgeeks.org/data-analysis/data-analysis-tutorial/'], 'youtube': 'https://www.youtube.com/watch?v=JG2gXPo-Z-E' },
    'HTML': { 'websites': ['https://developer.mozilla.org/en-US/docs/Learn/HTML'], 'youtube': 'https://www.youtube.com/watch?v=kUMe1FH4CHE' },
    'CSS': { 'websites': ['https://web.dev/learn/css'], 'youtube': 'https://www.youtube.com/watch?v=OXGznpKZ_sA' },
    'Flask': { 'websites': ['https://flask.palletsprojects.com/en/stable/quickstart/'], 'youtube': 'https://www.youtube.com/watch?v=Z1RJmh_OqeA' },
    'Java': { 'websites': ['https://dev.java/learn/'], 'youtube': 'https://www.youtube.com/watch?v=grEKMHGYCs4'},
    'SQL': { 'websites': ['https://www.w3schools.com/sql/'], 'youtube': 'https://www.youtube.com/watch?v=HXV3zeQKqGY'},
    'Software Testing': { 'websites': ['https://www.geeksforgeeks.org/software-testing-basics/'], 'youtube': 'https://www.youtube.com/watch?v=sO8eSa_2jOg'},
    'JavaScript': { 'websites': ['https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide'], 'youtube': 'https://www.youtube.com/watch?v=PkZNo7MFNFg'},
    'Project Management': { 'websites': ['https://www.pmi.org/basics-of-project-management'], 'youtube': 'https://www.youtube.com/watch?v=z4_2yA4_kfs'},
    'MS-Excel': { 'websites': ['https://support.microsoft.com/en-us/excel'], 'youtube': 'https://www.youtube.com/watch?v=Vl0H-qTclOg'},
    'Marketing': { 'websites': ['https://neilpatel.com/what-is-digital-marketing/'], 'youtube': 'https://www.youtube.com/watch?v=nU-IIXBWlS4'},
    'English Proficiency': { 'websites': ['https://www.duolingo.com/'], 'youtube': 'https://www.youtube.com/watch?v=Gcyo4-s_cW4'}
}

class InternshipRecommender:
    def __init__(self):
        self.internships_df = None
        self._load_and_preprocess_data()

    def _load_and_preprocess_data(self):
        try:
            BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            CSV_PATH = os.path.join(BASE_DIR, 'internship_data.csv')
            
            if not os.path.exists(CSV_PATH):
                 raise FileNotFoundError(f"FATAL ERROR: '{os.path.basename(CSV_PATH)}' was not found.")

            df = pd.read_csv(CSV_PATH)

            # --- Map columns and process data ---
            df.rename(columns={
                'internship': 'title', 'company_name': 'company', 'location': 'location',
                'stipend': 'stipend', 'duration': 'duration', 'skills': 'tags'
            }, inplace=True)
            
            if 'id' not in df.columns:
                df['id'] = range(len(df))

            df['type'] = df['stipend'].apply(lambda x: 'unpaid' if 'unpaid' in str(x).lower() else 'paid')
            
            if 'sector' not in df.columns:
                df['sector'] = 'General'

            self.internships_df = df

            self.internships_df['tags'] = self.internships_df['tags'].fillna('').apply(
                lambda x: [tag.strip().lower() for tag in str(x).split(',')]
            )
            print("\n✅ Recommendation Engine: Dataset loaded and ready.")
        
        except Exception as e:
            print(f"\n❌ An unexpected error occurred while loading data: {e}")
            self.internships_df = None

    def _preprocess_text(self, text):
        return str(text).lower().strip()

    def recommend(self, profile):
        if self.internships_df is None:
            return pd.DataFrame()

        # --- DEBUG: Print the incoming user profile ---
        print("\n--- DEBUG: RECEIVED USER PROFILE ---")
        print(profile)
        # ----------------------------------------

        user_skills = set([self._preprocess_text(skill) for skill in profile.get('skills', [])])
        user_locations_raw = profile.get('location_preference', [])
        user_locations = [self._preprocess_text(loc) for loc in user_locations_raw if isinstance(loc, str)]
        
        # --- DEBUG: Print the processed user skills and locations ---
        print(f"--- DEBUG: Processed User Skills: {user_skills}")
        print(f"--- DEBUG: Processed User Locations: {user_locations}\n")
        # ---------------------------------------------------------

        recommendations = []
        
        # --- DEBUG: We will only print details for the first 10 internships it checks ---
        print("--- DEBUG: CHECKING TOP INTERNSHIPS ---")
        # --------------------------------------------------------------------------

        for index, internship in self.internships_df.head(10).iterrows():
            score = 0
            internship_skills = set(internship.get('tags', []))
            internship_location = self._preprocess_text(internship.get('location', ''))

            location_score = 0
            if user_locations and any(loc in internship_location for loc in user_locations):
                location_score = 50

            skill_score = 0
            if internship_skills and user_skills:
                matched_skills = user_skills.intersection(internship_skills)
                skill_match_ratio = len(matched_skills) / len(internship_skills) if len(internship_skills) > 0 else 0
                skill_score = skill_match_ratio * 50
            
            score = location_score + skill_score
            if location_score > 0 and skill_score > 0:
                score += 25

            missing_skills = internship_skills - user_skills
            
            # --- DEBUG: Print the calculation for each internship ---
            print(f"Internship: {internship.get('title', 'N/A')}")
            print(f"  - Required Skills: {internship_skills}")
            print(f"  - Matched Skills: {user_skills.intersection(internship_skills)}")
            print(f"  - Missing Skills: {missing_skills}")
            print(f"  - Location Score: {location_score}, Skill Score: {skill_score:.2f} -> TOTAL SCORE: {score:.2f}")
            # ------------------------------------------------------
            
            if score > 20:
                missing_skills_with_resources = []
                for skill in missing_skills:
                    resource_key = next((key for key in learning_resources_cache if key.lower() in skill.lower()), None)
                    if resource_key:
                        resources = learning_resources_cache[resource_key]
                        missing_skills_with_resources.append({
                            'skill': skill.strip().capitalize(),
                            'resources': resources
                        })

                recommendation_data = internship.to_dict()
                recommendation_data['score'] = score
                recommendation_data['missing_skills_with_resources'] = missing_skills_with_resources
                recommendations.append(recommendation_data)
        
        print("--- DEBUG: FINISHED CHECKING ---\n")
        sorted_recommendations = sorted(recommendations, key=lambda x: x['score'], reverse=True)
        
        recs_df = pd.DataFrame(sorted_recommendations)
        return recs_df.head(4)