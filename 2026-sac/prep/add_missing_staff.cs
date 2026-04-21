#include "../lib/_constants.cs"

# SAC 2026 - Handle people without WCA IDs
# Angie Casallas: registered (wcaUserId=520057, no WCA ID yet). Add as volunteer.
SetProperty([p520057], VOLUNTEER, true)

# Non-competing staff (Ana Milena, Danilo, Marcela): no longer in WCIF, pending re-registration
