# to add a branch from ckp

`git submodule add https://github.com/PolarityWorks/editor-zmk-config.git ./board-config/<keyboard folder name, must be valid dir>`

e.g. `git submodule add https://github.com/PolarityWorks/editor-zmk-config.git ./board-config/bt60v1_1u` to clone the master branch into the board-config folder. we only need to config folder inside the repo. THEN go to .gitmodules and add the intended branch

the above board directoryis will be the directory used to find the board

- also update board dir, update server\mapper.js -> getBoard

## update all submodule branches to latest

`git submodule update --recursive --remote`

## troubleshooting

### cleanup

- if for some reason you screwed up and wanna redo the submodule clone
- go into .git and delete the /modules folder, its the submodule 'mirror' of what you did

## wheres my branch?

- if you're not on the right branch on your submodule:
  - go into .gitmodules and add `branch = <your intended branch>` under the submodule config
  - `git submodule update --remote`

## verbose (all the submodule inits)

git submodule add https://github.com/PolarityWorks/editor-zmk-config.git ./board-config/bt60v1_1u
git submodule add https://github.com/PolarityWorks/editor-zmk-config.git ./board-config/bt60v1_ansi
git submodule add https://github.com/PolarityWorks/editor-zmk-config.git ./board-config/bt60v1_hotswap
git submodule add https://github.com/PolarityWorks/editor-zmk-config.git ./board-config/bt60v1_iso
git submodule add https://github.com/PolarityWorks/editor-zmk-config.git ./board-config/bt60v1_tsangan

git submodule add https://github.com/PolarityWorks/editor-zmk-config.git ./board-config/bt60v2_1u
git submodule add https://github.com/PolarityWorks/editor-zmk-config.git ./board-config/bt60v2_ansi
git submodule add https://github.com/PolarityWorks/editor-zmk-config.git ./board-config/bt60v2_iso
git submodule add https://github.com/PolarityWorks/editor-zmk-config.git ./board-config/bt60v2_tsangan

git submodule add https://github.com/PolarityWorks/editor-zmk-config.git ./board-config/bt65v1_1u
git submodule add https://github.com/PolarityWorks/editor-zmk-config.git ./board-config/bt65v1_ansi
git submodule add https://github.com/PolarityWorks/editor-zmk-config.git ./board-config/bt65v1_iso
git submodule add https://github.com/PolarityWorks/editor-zmk-config.git ./board-config/bt65v1_tsangan

git submodule add https://github.com/PolarityWorks/editor-zmk-config.git ./board-config/bt75v1_1u
git submodule add https://github.com/PolarityWorks/editor-zmk-config.git ./board-config/bt75v1_ansi
git submodule add https://github.com/PolarityWorks/editor-zmk-config.git ./board-config/bt75v1_iso

then go to .gitmodules and add all the right branch names
finally, `git submodule update --remote`
