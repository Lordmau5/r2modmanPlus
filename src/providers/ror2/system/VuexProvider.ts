import { Store } from 'vuex';
import ProviderUtils from '../../generic/ProviderUtils';

export default class VuexProvider {

    private static store: Store<any>;

    static provide(store: Store<any>) {
        this.store = store;
    }

    public static get instance() {
        if (this.store === undefined) {
            ProviderUtils.throwNotProvidedError('VuexProvider');
        }
        return this.store;
    }
}
