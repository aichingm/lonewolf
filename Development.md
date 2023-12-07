# Lonewolf

## Version Numbers

There are a few places where version numbers appare:

|App    |Path                                            |Version|Used|
|:------|:-----------------------------------------------|:------|:---|
|Core   |lonewolf/content/version.ts:3                   |`x.y.z`|Yes |
|Web    |lonewolf-web/src-platform/content/version.ts:3  |`x.y.z`|Yes |
|Desktop|lonewolf-tauri/src-platform/content/version.ts:3|`x.y.z`|Yes |
|Desktop|lonewolf-tauri/src-tauri/tauri.conf.json:11     |`x.y.z`|Yes |
|Desktop|lonewolf-tauri/src-tauri/Cargo.toml:3           |`0.0.0`|No  |
|Desktop|lonewolf-tauri/package.json:4                   |`0.0.0`|No  |
|Desktop|lonewolf-tauri/package-lock.json:3              |`0.0.0`|No  |
|Desktop|lonewolf-tauri/package-lock.json:9              |`0.0.0`|No  |
|Web    |lonewolf-web/package.json:3                     |`0.0.0`|No  |
|Web    |lonewolf-web/package-lock.json:3                |`0.0.0`|No  |
|Web    |lonewolf-web/package-lock.json:9                |`0.0.0`|No  |

Only the first three are actually used. Every where a version number needs to be used it should be taken from one of those three. **Leave all other version set to `0.0.0`**
