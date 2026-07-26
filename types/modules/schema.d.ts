import sinon from 'sinon';
export declare class Schema {
    #private;
    _sandbox: sinon.SinonSandbox;
    _importMap: Map<any, any>;
    _refMap: Map<any, any>;
    _browser: {
        _sandbox: sinon.SinonSandbox;
    } | null;
    _schema: any;
    constructor(...args?: (string | object)[]);
    get channel(): any;
    set channel(ch: any);
    private _getTargetFromNamespace;
    private _assignImportMap;
    private _assignRefMap;
    private _mockEvents;
    private _mockFunctions;
    private _mockProperties;
    private _mockTypes;
    private _parseSchemaContent;
    get(name: string): Array<object> | null;
    getAll(): object;
    list(): Array<string>;
    mock(): object;
}
