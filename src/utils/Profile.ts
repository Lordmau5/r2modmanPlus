import R2Error from "../model/errors/R2Error";
import ManifestV2 from "../model/ManifestV2";
import Profile from "../model/Profile";
import ConflictManagementProvider from "../providers/generic/installing/ConflictManagementProvider";
import ProfileInstallerProvider from "../providers/ror2/installing/ProfileInstallerProvider";
import VuexProvider from "../providers/ror2/system/VuexProvider";
import ProfileModList from "../r2mm/mods/ProfileModList";


export const disableModsFromActiveProfile = async (
    mods: ManifestV2[],
    onProgress?: (mod: ManifestV2) => void,
) => {
    const profile = Profile.getActiveProfile();

    // Sanity check.
    if (profile === undefined) {
        throw new R2Error(
            'No active profile found',
            'Unable to disable mods when active profile is not set.'
        )
    }

    await disableModsFromProfile(mods, profile, onProgress);
};

export const disableModsFromProfile = async (
    mods: ManifestV2[],
    profile: Profile,
    onProgress?: (mod: ManifestV2) => void,
) => {
    // Disable mods on disk.
    for (const mod of mods) {
        onProgress && onProgress(mod);

        const err = await ProfileInstallerProvider.instance.disableMod(mod, profile);
        if (err instanceof R2Error) {
            throw err;
        }
    }

    // Update mod list status to mods.yml and Vuex.
    const updatedList = await ProfileModList.updateMods(mods, profile, (mod) => mod.disable());
    if (updatedList instanceof R2Error) {
        throw updatedList;
    }
    VuexProvider.instance.dispatch('updateModList', updatedList);

    // IDK but sounds important.
    const err = await ConflictManagementProvider.instance.resolveConflicts(updatedList, profile);
    if (err instanceof R2Error) {
        throw err;
    }
};
