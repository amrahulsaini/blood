// Blood Group Compatibility Checker

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

/**
 * Determines which blood groups a donor can donate to
 */
export function canDonateTo(donorBloodGroup: BloodGroup, recipientBloodGroup: BloodGroup): boolean {
  const compatibilityMap: Record<BloodGroup, BloodGroup[]> = {
    'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal donor
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'A-': ['A-', 'A+', 'AB-', 'AB+'],
    'A+': ['A+', 'AB+'],
    'B-': ['B-', 'B+', 'AB-', 'AB+'],
    'B+': ['B+', 'AB+'],
    'AB-': ['AB-', 'AB+'],
    'AB+': ['AB+'], // Universal recipient (can only donate to AB+)
  };

  return compatibilityMap[donorBloodGroup]?.includes(recipientBloodGroup) || false;
}

/**
 * Gets list of blood groups that can donate to recipient
 */
export function getCompatibleDonors(recipientBloodGroup: BloodGroup): BloodGroup[] {
  const allBloodGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
  return allBloodGroups.filter(donor => canDonateTo(donor, recipientBloodGroup));
}

/**
 * Gets list of blood groups that recipient can donate to
 */
export function getCompatibleRecipients(donorBloodGroup: BloodGroup): BloodGroup[] {
  const compatibilityMap: Record<BloodGroup, BloodGroup[]> = {
    'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'A-': ['A-', 'A+', 'AB-', 'AB+'],
    'A+': ['A+', 'AB+'],
    'B-': ['B-', 'B+', 'AB-', 'AB+'],
    'B+': ['B+', 'AB+'],
    'AB-': ['AB-', 'AB+'],
    'AB+': ['AB+'],
  };

  return compatibilityMap[donorBloodGroup] || [];
}

/**
 * Validates if a blood group string is valid
 */
export function isValidBloodGroup(bloodGroup: string): bloodGroup is BloodGroup {
  const validGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  return validGroups.includes(bloodGroup as BloodGroup);
}

/**
 * Gets a user-friendly compatibility message
 */
export function getCompatibilityMessage(donorBloodGroup: BloodGroup, recipientBloodGroup: BloodGroup): string {
  if (canDonateTo(donorBloodGroup, recipientBloodGroup)) {
    return `✓ ${donorBloodGroup} can donate to ${recipientBloodGroup}`;
  } else {
    return `✗ ${donorBloodGroup} cannot donate to ${recipientBloodGroup}`;
  }
}
