import { memo } from 'react'
import { useSelectOrDelete } from '../../hooks'
import type { WorkflowNodesMap } from './node'
import { DELETE_WORKFLOW_VARIABLE_BLOCK_COMMAND } from './index'
import { Variable02 } from '@/app/components/base/icons/src/vender/solid/development'
import { VarBlockIcon } from '@/app/components/workflow/block-icon'
import { Line3 } from '@/app/components/base/icons/src/public/common'
import { isSystemVar } from '@/app/components/workflow/nodes/_base/components/variable/utils'

type WorkflowVariableBlockComponentProps = {
  nodeKey: string
  variables: string[]
  workflowNodesMap: WorkflowNodesMap
}

const WorkflowVariableBlockComponent = ({
  nodeKey,
  variables,
  workflowNodesMap = {},
}: WorkflowVariableBlockComponentProps) => {
  const [ref, isSelected] = useSelectOrDelete(nodeKey, DELETE_WORKFLOW_VARIABLE_BLOCK_COMMAND)
  const node = workflowNodesMap[variables[0]]
  const variablesLength = variables.length
  const lastVariable = isSystemVar(variables) ? variables.join('.') : variables[variablesLength - 1]

  return (
    <div
      className={`
        mx-0.5 relative group/wrap flex items-center h-[18px] pl-0.5 pr-[3px] rounded-[5px] border
        ${isSelected ? ' border-[#84ADFF] bg-[#F5F8FF]' : ' border-black/5 bg-white'}
      `}
      ref={ref}
    >
      <div className='flex items-center'>
        {
          node?.type && (
            <div className='p-[1px]'>
              <VarBlockIcon
                className='!text-gray-500'
                type={node?.type}
              />
            </div>
          )
        }
        <div className='shrink-0 mx-0.5 text-xs font-medium text-gray-500 truncate' title={node?.title} style={{
        }}>{node?.title}</div>
        <Line3 className='mr-0.5 text-gray-300'></Line3>
      </div>
      <div className='flex items-center text-primary-600'>
        <Variable02 className='w-3.5 h-3.5' />
        <div className='shrink-0 ml-0.5 text-xs font-medium truncate' title={lastVariable}>{lastVariable}</div>
      </div>
    </div>
  )
}

export default memo(WorkflowVariableBlockComponent)
