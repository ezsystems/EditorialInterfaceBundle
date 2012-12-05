<?php
/**
 * File containing the ContentExtension class.
 *
 * @copyright Copyright (C) 1999-2012 eZ Systems AS. All rights reserved.
 * @license http://www.gnu.org/licenses/gpl-2.0.txt GNU General Public License v2
 * @version //autogentag//
 */

namespace EzSystems\EditorialInterfaceBundle\Twig\Extension;

use Symfony\Component\DependencyInjection\ContainerInterface;
use eZ\Publish\API\Repository\Values\Content\Field;
use eZ\Publish\API\Repository\Repository;
use eZ\Publish\Core\Repository\Values\Content\Content;
use eZ\Publish\Core\MVC\ConfigResolverInterface;
use eZ\Publish\Core\MVC\Symfony\Templating\Twig\Extension\ContentExtension as CoreContentExtension;

class ContentExtension extends CoreContentExtension
{
    /**
     * The repository
     *
     * @var \eZ\Publish\API\Repository\Repository
     */
    protected $repository;

    const DATA_PREFIX = 'data-ez-';


    public function __construct(
        ContainerInterface $container, Repository $repository, ConfigResolverInterface $resolver
    )
    {
        parent::__construct( $container, $resolver );
        $this->repository = $repository;
    }

    /**
     * Returns the metadata for the given $field in the $content.
     *
     * @param \eZ\Publish\Core\Repository\Values\Content\Content $content
     * @param \eZ\Publish\API\Repository\Values\Content\Field $field
     * @return array
     */
    protected function getMetadata( Content $content, Field $field )
    {
        $versionInfo = $content->getVersionInfo();

        return array(
            self::DATA_PREFIX . 'field-id' => $field->id,
            self::DATA_PREFIX . 'field-identifier' => $field->fieldDefIdentifier,
            self::DATA_PREFIX . 'field-type-identifier' => $this->getFieldTypeIdentifier( $content, $field ),
            self::DATA_PREFIX . 'content-id' => $versionInfo->getContentInfo()->id,
            self::DATA_PREFIX . 'version' => $versionInfo->versionNo,
            self::DATA_PREFIX . 'locale-code' => $field->languageCode
        );
    }

    /**
     * Generates the array of parameter to pass to the field template. For now
     * the metadata are only added if the current user is able to edit.
     *
     * @param \eZ\Publish\Core\Repository\Values\Content\Content $content
     * @param \eZ\Publish\Core\Repository\Values\Content\Field $field the Field to display
     * @param array $params An array of parameters to pass to the field view
     *
     * @return array
     */
    protected function getRenderFieldBlockParameters(
        Content $content, Field $field, array $params = array()
    )
    {
        $defaultParams = parent::getRenderFieldBlockParameters( $content, $field, $params );
        if ( $this->repository->canUser( 'content', 'edit', $content ) )
        {
            $defaultParams['attr'] += $this->getMetadata( $content, $field );
        }
        return $defaultParams;
    }

}


