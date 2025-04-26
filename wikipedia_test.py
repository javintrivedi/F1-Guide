import wikipedia

def get_formula_one_summary():
    wikipedia.set_lang("en")
    summary = wikipedia.page("Formula One").content
    return summary
